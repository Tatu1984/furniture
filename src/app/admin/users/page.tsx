"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Users as UsersIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Pencil,
  Loader2,
} from "lucide-react";

import { PageHeader } from "@/components/admin/shared/page-header";
import {
  DataTable,
  DataTableColumnHeader,
} from "@/components/admin/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// --- Types ---

type UserRole = "admin" | "manager" | "editor" | "ops";
type UserStatus = "pending" | "active" | "suspended" | "inactive";

type ApiUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: "ADMIN" | "MANAGER" | "EDITOR" | "OPS";
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "INACTIVE";
  isActive: boolean;
  avatar: string | null;
  emailVerified: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  joinDate: string;
  lastLogin: string | null;
  avatar?: string;
};

function mapApiUser(u: ApiUser): User {
  return {
    id: u.id,
    firstName: u.firstName ?? "",
    lastName: u.lastName ?? "",
    email: u.email,
    role: u.role.toLowerCase() as UserRole,
    status: u.status.toLowerCase() as UserStatus,
    joinDate: u.createdAt,
    lastLogin: u.lastLoginAt,
    avatar: u.avatar ?? "",
  };
}

// --- Role Badge Colors ---

const roleBadgeConfig: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-800 border-purple-200",
  manager: "bg-blue-100 text-blue-800 border-blue-200",
  editor: "bg-cyan-100 text-cyan-800 border-cyan-200",
  ops: "bg-amber-100 text-amber-800 border-amber-200",
};


// --- Helpers ---

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(u: User) {
  const f = u.firstName?.[0] ?? "";
  const l = u.lastName?.[0] ?? "";
  return (f + l).toUpperCase() || u.email[0]?.toUpperCase() || "?";
}

// --- Columns ---

const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
  },
  {
    id: "user",
    accessorFn: (row) => `${row.firstName} ${row.lastName} ${row.email}`,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="User" />
    ),
    cell: ({ row }) => {
      const name = `${row.original.firstName} ${row.original.lastName}`.trim();
      return (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>{initials(row.original)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name || "(no name)"}</p>
            <p className="text-sm text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      const role = row.original.role;
      return (
        <Badge
          variant="outline"
          className={`font-medium capitalize ${roleBadgeConfig[role]}`}
        >
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "joinDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Joined" />
    ),
    cell: ({ row }) => formatDate(row.original.joinDate),
  },
  {
    accessorKey: "lastLogin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Login" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDateTime(row.original.lastLogin)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link href={`/admin/users/${row.original.id}`}>
        <Button variant="ghost" size="sm">
          <Pencil className="mr-1 size-4" />
          Edit
        </Button>
      </Link>
    ),
    enableSorting: false,
  },
];

// --- Page ---

export default function UsersPage() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/users?limit=100");
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Failed to load users");
        }
        const json = await res.json();
        if (cancelled) return;
        setUsers((json.data as ApiUser[]).map(mapApiUser));
      } catch (err) {
        if (!cancelled) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load users",
          );
          setUsers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = React.useMemo(() => {
    let result = users;

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }

    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    return result;
  }, [users, search, statusFilter, roleFilter]);

  const stats = React.useMemo(
    () => ({
      total: users.length,
      pending: users.filter((u) => u.status === "pending").length,
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
    }),
    [users]
  );

  const statusFilters = ["all", "pending", "active", "suspended"] as const;
  const roleFilters = ["all", "admin", "manager", "editor", "ops"] as const;

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage user accounts and roles">
        <Button asChild>
          <Link href="/admin/users/new">
            <Plus className="size-4" />
            Add User
          </Link>
        </Button>
      </PageHeader>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <UsersIcon className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700">
              <Clock className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-green-100 text-green-700">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <XCircle className="size-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Suspended</p>
              <p className="text-2xl font-bold">{stats.suspended}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-1">Status:</span>
            {statusFilters.map((s) => (
              <Button
                key={s}
                variant={statusFilter === s ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(s)}
                className="capitalize"
              >
                {s}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground mr-1">Role:</span>
            {roleFilters.map((r) => (
              <Button
                key={r}
                variant={roleFilter === r ? "default" : "outline"}
                size="sm"
                onClick={() => setRoleFilter(r)}
                className="capitalize"
              >
                {r}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading users...</span>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          searchKey="user"
          searchPlaceholder="Search users..."
        />
      )}
    </div>
  );
}
