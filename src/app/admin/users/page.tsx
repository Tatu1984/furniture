"use client";

import * as React from "react";
import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import {
  Users as UsersIcon,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Search,
  Pencil,
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

type UserRole = "admin" | "manager" | "staff" | "customer";
type UserStatus = "pending" | "active" | "suspended";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  orders: number;
  joinDate: string;
  lastLogin: string;
  avatar?: string;
};

// --- Role Badge Colors ---

const roleBadgeConfig: Record<UserRole, string> = {
  admin: "bg-purple-100 text-purple-800 border-purple-200",
  manager: "bg-blue-100 text-blue-800 border-blue-200",
  staff: "bg-cyan-100 text-cyan-800 border-cyan-200",
  customer: "bg-gray-100 text-gray-800 border-gray-200",
};

// --- Mock Data ---

const users: User[] = [
  { id: "1", firstName: "Sarah", lastName: "Johnson", email: "sarah.johnson@email.com", role: "admin", status: "active", orders: 0, joinDate: "2023-01-15", lastLogin: "2025-12-20T14:30:00Z", avatar: "" },
  { id: "2", firstName: "Michael", lastName: "Chen", email: "michael.chen@email.com", role: "manager", status: "active", orders: 0, joinDate: "2023-03-22", lastLogin: "2025-12-19T09:15:00Z", avatar: "" },
  { id: "3", firstName: "Emily", lastName: "Davis", email: "emily.davis@email.com", role: "customer", status: "active", orders: 12, joinDate: "2023-05-10", lastLogin: "2025-12-18T16:45:00Z", avatar: "" },
  { id: "4", firstName: "James", lastName: "Wilson", email: "james.wilson@email.com", role: "customer", status: "pending", orders: 0, joinDate: "2025-12-15", lastLogin: "2025-12-15T10:00:00Z", avatar: "" },
  { id: "5", firstName: "Lisa", lastName: "Anderson", email: "lisa.anderson@email.com", role: "staff", status: "active", orders: 0, joinDate: "2023-07-01", lastLogin: "2025-12-20T08:00:00Z", avatar: "" },
  { id: "6", firstName: "Robert", lastName: "Taylor", email: "robert.taylor@email.com", role: "customer", status: "suspended", orders: 3, joinDate: "2023-06-18", lastLogin: "2025-10-05T12:00:00Z", avatar: "" },
  { id: "7", firstName: "Amanda", lastName: "Martinez", email: "amanda.martinez@email.com", role: "customer", status: "active", orders: 27, joinDate: "2022-11-03", lastLogin: "2025-12-19T17:30:00Z", avatar: "" },
  { id: "8", firstName: "David", lastName: "Brown", email: "david.brown@email.com", role: "manager", status: "active", orders: 0, joinDate: "2023-02-14", lastLogin: "2025-12-20T11:45:00Z", avatar: "" },
  { id: "9", firstName: "Jennifer", lastName: "Lee", email: "jennifer.lee@email.com", role: "customer", status: "active", orders: 8, joinDate: "2023-09-25", lastLogin: "2025-12-17T14:20:00Z", avatar: "" },
  { id: "10", firstName: "Christopher", lastName: "Garcia", email: "chris.garcia@email.com", role: "customer", status: "pending", orders: 1, joinDate: "2025-12-10", lastLogin: "2025-12-12T09:00:00Z", avatar: "" },
  { id: "11", firstName: "Michelle", lastName: "Robinson", email: "michelle.robinson@email.com", role: "staff", status: "active", orders: 0, joinDate: "2023-08-15", lastLogin: "2025-12-20T07:30:00Z", avatar: "" },
  { id: "12", firstName: "Daniel", lastName: "White", email: "daniel.white@email.com", role: "customer", status: "active", orders: 15, joinDate: "2023-04-02", lastLogin: "2025-12-19T20:00:00Z", avatar: "" },
  { id: "13", firstName: "Ashley", lastName: "Thompson", email: "ashley.thompson@email.com", role: "customer", status: "suspended", orders: 2, joinDate: "2023-10-11", lastLogin: "2025-09-20T10:00:00Z", avatar: "" },
  { id: "14", firstName: "Kevin", lastName: "Harris", email: "kevin.harris@email.com", role: "customer", status: "active", orders: 5, joinDate: "2024-01-20", lastLogin: "2025-12-18T13:00:00Z", avatar: "" },
  { id: "15", firstName: "Stephanie", lastName: "Clark", email: "stephanie.clark@email.com", role: "admin", status: "active", orders: 0, joinDate: "2022-06-01", lastLogin: "2025-12-20T15:00:00Z", avatar: "" },
  { id: "16", firstName: "Brian", lastName: "Lewis", email: "brian.lewis@email.com", role: "customer", status: "active", orders: 19, joinDate: "2023-02-28", lastLogin: "2025-12-20T10:30:00Z", avatar: "" },
  { id: "17", firstName: "Nicole", lastName: "Walker", email: "nicole.walker@email.com", role: "customer", status: "pending", orders: 0, joinDate: "2025-12-18", lastLogin: "2025-12-18T08:00:00Z", avatar: "" },
  { id: "18", firstName: "Ryan", lastName: "Hall", email: "ryan.hall@email.com", role: "staff", status: "active", orders: 0, joinDate: "2024-03-10", lastLogin: "2025-12-19T16:00:00Z", avatar: "" },
  { id: "19", firstName: "Rachel", lastName: "Allen", email: "rachel.allen@email.com", role: "customer", status: "active", orders: 9, joinDate: "2023-11-05", lastLogin: "2025-12-16T12:15:00Z", avatar: "" },
  { id: "20", firstName: "Thomas", lastName: "Young", email: "thomas.young@email.com", role: "customer", status: "suspended", orders: 1, joinDate: "2024-05-22", lastLogin: "2025-08-14T09:00:00Z", avatar: "" },
  { id: "21", firstName: "Lauren", lastName: "King", email: "lauren.king@email.com", role: "customer", status: "suspended", orders: 4, joinDate: "2024-02-14", lastLogin: "2025-07-30T11:00:00Z", avatar: "" },
  { id: "22", firstName: "Jason", lastName: "Wright", email: "jason.wright@email.com", role: "customer", status: "active", orders: 31, joinDate: "2022-09-15", lastLogin: "2025-12-20T09:45:00Z", avatar: "" },
  { id: "23", firstName: "Megan", lastName: "Scott", email: "megan.scott@email.com", role: "manager", status: "active", orders: 0, joinDate: "2023-07-20", lastLogin: "2025-12-20T13:00:00Z", avatar: "" },
];

// --- Helpers ---

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar size="sm">
          <AvatarFallback>
            {row.original.firstName[0]}
            {row.original.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{row.original.email}</p>
        </div>
      </div>
    ),
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
    accessorKey: "orders",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Orders" />
    ),
    cell: ({ row }) => row.original.orders,
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
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [roleFilter, setRoleFilter] = React.useState<string>("all");

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
  }, [search, statusFilter, roleFilter]);

  const stats = React.useMemo(
    () => ({
      total: users.length,
      pending: users.filter((u) => u.status === "pending").length,
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
    }),
    []
  );

  const statusFilters = ["all", "pending", "active", "suspended"] as const;
  const roleFilters = ["all", "admin", "manager", "staff", "customer"] as const;

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

      <DataTable
        columns={columns}
        data={filteredUsers}
        searchKey="user"
        searchPlaceholder="Search users..."
      />
    </div>
  );
}
