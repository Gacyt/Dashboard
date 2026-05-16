"use client";

export type CreateKind =
  | "expense"
  | "task"
  | "habit"
  | "journal"
  | "workout-day"
  | "exercise";

type CreateHubOpenDetail = {
  kind?: CreateKind | null;
};

type CreateHubCreatedDetail = {
  kind: CreateKind;
};

export const NX_CREATE_HUB_OPEN_EVENT = "nx:create-hub-open";
export const NX_CREATE_HUB_CREATED_EVENT = "nx:create-hub-created";

export function openCreateHub(kind?: CreateKind | null) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent<CreateHubOpenDetail>(NX_CREATE_HUB_OPEN_EVENT, {
      detail: { kind: kind ?? null }
    })
  );
}

export function emitCreateHubCreated(kind: CreateKind) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(
    new CustomEvent<CreateHubCreatedDetail>(NX_CREATE_HUB_CREATED_EVENT, {
      detail: { kind }
    })
  );
}
