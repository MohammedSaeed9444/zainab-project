import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ticketStore } from "@/lib/ticketStore";
import { Ticket, TicketReason } from "@/types/ticket";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>(() => ticketStore.getAll());
  const [reasonFilter, setReasonFilter] = useState<string>("all");

  const getPriorityOrder = (reason: TicketReason): number => {
    const order: Record<TicketReason, number> = {
      "Harassment": 1,
      "Took extra money": 2,
      "Bad behavior": 3,
      "Drop": 4,
    };
    return order[reason];
  };

  const getPriorityVariant = (reason: TicketReason) => {
    switch (reason) {
      case "Harassment":
        return "destructive";
      case "Took extra money":
        return "default";
      case "Bad behavior":
        return "secondary";
      default:
        return "outline";
    }
  };

  const filteredAndSortedTickets = useMemo(() => {
    let result = [...tickets];

    if (reasonFilter !== "all") {
      result = result.filter((ticket) => ticket.reason === reasonFilter);
    }

    result.sort((a, b) => getPriorityOrder(a.reason) - getPriorityOrder(b.reason));

    return result;
  }, [tickets, reasonFilter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Ticket Dashboard</h2>
          <p className="text-muted-foreground mt-1">View and manage all support tickets</p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          {filteredAndSortedTickets.length} {filteredAndSortedTickets.length === 1 ? 'Ticket' : 'Tickets'}
        </Badge>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Tickets</CardTitle>
              <CardDescription>Sorted by priority (Harassment → Extra Money → Bad Behavior)</CardDescription>
            </div>
            <div className="w-64">
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="Harassment">Harassment</SelectItem>
                  <SelectItem value="Took extra money">Took extra money</SelectItem>
                  <SelectItem value="Bad behavior">Bad behavior</SelectItem>
                  <SelectItem value="Drop">Drop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAndSortedTickets.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No tickets found</p>
              <p className="text-sm text-muted-foreground mt-2">Create your first ticket to get started</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Trip Date</TableHead>
                    <TableHead className="font-semibold">Driver ID</TableHead>
                    <TableHead className="font-semibold">Reason</TableHead>
                    <TableHead className="font-semibold">City</TableHead>
                    <TableHead className="font-semibold">Service</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Agent</TableHead>
                    <TableHead className="font-semibold">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm">{ticket.id.slice(-6)}</TableCell>
                      <TableCell>{format(ticket.tripDate, "MMM dd, yyyy")}</TableCell>
                      <TableCell className="font-medium">{ticket.driverId}</TableCell>
                      <TableCell>
                        <Badge variant={getPriorityVariant(ticket.reason)}>
                          {ticket.reason}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.city}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.serviceType}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{ticket.customerPhone}</TableCell>
                      <TableCell>{ticket.agentName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(ticket.createdAt, "MMM dd, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
