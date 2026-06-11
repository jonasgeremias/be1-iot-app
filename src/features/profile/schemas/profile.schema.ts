import { z } from 'zod';

/**
 * Authenticated user (GET /users/{id}) — lenient, since the backend returns the
 * full IUser. We only consume a subset; extra keys pass through.
 */
export const profileUserSchema = z
  .object({
    id: z.string(),
    name: z.string().optional().default(''),
    email: z.string().optional().default(''),
    cpf: z.string().nullish(),
    phone: z.string().nullish(),
    birthdate: z.string().nullish(),
    avatarUrl: z.string().nullish(),
    avatar: z.string().nullish(),
    cityId: z.string().nullish(),
    cityRelation: z.any().optional(),
    roles: z.array(z.object({ name: z.string() }).passthrough()).nullish(),
  })
  .passthrough();

/** Explicit type (z.any on cityRelation keeps inference clean). */
export type ProfileUser = {
  id: string;
  name: string;
  email: string;
  cpf?: string | null;
  phone?: string | null;
  birthdate?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
  cityId?: string | null;
  cityRelation?: {
    name?: string | null;
    stateId?: string | null;
    state?: { name?: string | null; uf?: string | null } | null;
  } | null;
  roles?: { name: string }[] | null;
};

/** Editable fields submitted to POST /users/update/{id}. */
export type ProfileUpdateInput = {
  name?: string;
  phone?: string;
  cpf?: string;
  birthdate?: string;
  cityId?: string;
};
