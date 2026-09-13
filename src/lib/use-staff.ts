import { useEffect, useState } from "react";
import { isStaffUser } from "@/data/staff";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { getDeskAccess } from "@/server/staff";
import { hasCap, type DeskCap, type DeskRole } from "@/lib/rbac";

export function useDeskAccess() {
  const { user, isPending } = useCurrentUserState();
  const [role, setRole] = useState<DeskRole | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setReady(!isPending);
      return;
    }
    let live = true;
    void getDeskAccess()
      .then((access) => {
        if (!live) return;
        setRole(access.staff ? access.role : null);
        setReady(true);
      })
      .catch(() => {
        if (!live) return;
        setRole(isStaffUser(user) ? "owner" : null);
        setReady(true);
      });
    return () => {
      live = false;
    };
  }, [user, isPending]);

  const staff = role !== null;
  return {
    user,
    isPending: isPending || Boolean(user && !ready),
    staff,
    role,
    can: (cap: DeskCap) => hasCap(role, cap),
  };
}

export function useIsStaff() {
  const desk = useDeskAccess();
  return { user: desk.user, isPending: desk.isPending, staff: desk.staff };
}
