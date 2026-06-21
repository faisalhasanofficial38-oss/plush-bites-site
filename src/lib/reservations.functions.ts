import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type ReservationStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type Reservation = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  guests: number;
  visit_date: string;
  visit_time: string;
  selected_foods: string;
  special_request: string;
  status: ReservationStatus;
  created_at: string;
};

const ReservationInput = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(4).max(40),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  guests: z.number().int().min(1).max(50),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  visit_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  selected_foods: z.string().max(1000).default(""),
  special_request: z.string().max(1000).default(""),
});

export const createReservation = createServerFn({ method: "POST" })
  .inputValidator((input) => ReservationInput.parse(input))
  .handler(async ({ data }) => {
    const sb = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { error } = await sb.from("reservations").insert({
      name: data.name,
      phone: data.phone,
      email: data.email && data.email.length > 0 ? data.email : null,
      guests: data.guests,
      visit_date: data.visit_date,
      visit_time: data.visit_time,
      selected_foods: data.selected_foods,
      special_request: data.special_request,
    });
    if (error) {
      console.error("[createReservation]", error);
      throw new Error("We couldn't save your reservation. Please call us instead.");
    }
    return { ok: true };
  });

export const listReservations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId, _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { data, error } = await context.supabase
      .from("reservations")
      .select("id, name, phone, email, guests, visit_date, visit_time, selected_foods, special_request, status, created_at")
      .order("visit_date", { ascending: false })
      .order("visit_time", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Reservation[];
  });

const StatusInput = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
});

export const updateReservationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => StatusInput.parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId, _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await context.supabase
      .from("reservations").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteReservation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId, _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { error } = await context.supabase.from("reservations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });