import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { CalendarIcon } from "lucide-react";

const Dashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>(() => ticketStore.getAll());
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

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

    // Filter by reason
    if (reasonFilter !== "all") {
      result = result.filter((ticket) => ticket.reason === reasonFilter);
    }

    // Filter by date
    if (dateFilter) {
      result = result.filter((ticket) => {
        const ticketDate = format(ticket.tripDate, "yyyy-MM-dd");
        const filterDate = format(dateFilter, "yyyy-MM-dd");
        return ticketDate === filterDate;
      });
    }

    // Sort by creation date (newest first)
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return result;
  }, [tickets, reasonFilter, dateFilter]);

  const totalPages = Math.ceil(filteredAndSortedTickets.length / ITEMS_PER_PAGE);
  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTickets.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedTickets, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleReasonFilterChange = (value: string) => {
    setReasonFilter(value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (date: Date | undefined) => {
    setDateFilter(date);
    setCurrentPage(1);
  };

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
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle>All Tickets</CardTitle>
              <CardDescription>Sorted by creation date (newest first)</CardDescription>
            </div>
            <div className="flex gap-4">
              <div className="w-64">
                <Select value={reasonFilter} onValueChange={handleReasonFilterChange}>
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-64 justify-start text-left font-normal",
                      !dateFilter && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={handleDateFilterChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {dateFilter && (
                <Button
                  variant="ghost"
                  onClick={() => handleDateFilterChange(undefined)}
                >
                  Clear Date
                </Button>
              )}
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
                    <TableHead className="font-semibold">Trip ID</TableHead>
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
                  {paginatedTickets.map((ticket) => (
                    <TableRow key={ticket.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-mono text-sm">{ticket.id.slice(-6)}</TableCell>
                      <TableCell className="font-medium">{ticket.tripId}</TableCell>
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
          {filteredAndSortedTickets.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedTickets.length)} of {filteredAndSortedTickets.length} tickets
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      className={cn(
                        currentPage === 1 && "pointer-events-none opacity-50",
                        "cursor-pointer"
                      )}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <span className="text-sm px-4">
                      Page {currentPage} of {totalPages}
                    </span>
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      className={cn(
                        currentPage === totalPages && "pointer-events-none opacity-50",
                        "cursor-pointer"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
