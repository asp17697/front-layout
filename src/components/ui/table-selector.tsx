"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";

import {
  Database,
  Table2,
  ChevronDown,
  Search,
  RefreshCw,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { fetchDatabaseTables } from "@/services/monza/databaseTablesServices";


type TableItem = string;

// Simple in-memory cache to avoid re-fetching tables for the same schema
// across multiple TableSelector instances. Also dedupe concurrent requests.
const tablesCache: Map<string, TableItem[]> = new Map();
const inFlightRequests: Map<string, Promise<TableItem[]>> = new Map();

interface TableSelectorProps {
  readonly currentTable?: string;
  readonly connectionConfig?: any;
  readonly connectionStatus?: "connected" | "disconnected" | "error";
  readonly onTableChange: (tableName: string, tableInfo: TableItem) => void;
  readonly variant?: "compact" | "full";
  readonly className?: string;
  readonly disabled?: boolean;
  readonly menuWidth?: string;
}

export function TableSelector({
  currentTable,
  connectionConfig,
  connectionStatus = "disconnected",
  onTableChange,
  variant = "compact",
  className = "",
  disabled = false,
  menuWidth = "",
}: TableSelectorProps) {
  const [availableTables, setAvailableTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showBrowser, setShowBrowser] = useState(false);

  // Load available tables when connection is ready
  useEffect(() => {
      loadTables();
  }, []);

  const loadTables = async () => {
  
    const schemaKey =  "default";

    // Serve from cache if available
    if (tablesCache.has(schemaKey)) {
      setAvailableTables(tablesCache.get(schemaKey) || []);
      return;
    }

    // If there's an in-flight fetch for this schema, await it
    if (inFlightRequests.has(schemaKey)) {
      try {
        const tables = await inFlightRequests.get(schemaKey)!;
        setAvailableTables(tables);
      } catch {
        // handled below on fresh fetch; keep silent here
      }
      return;
    }

    setLoading(true);
    setError("");

    try {
      const requestPromise = (async (): Promise<TableItem[]> => {
       const result = await fetchDatabaseTables(schemaKey);
        if (result.status === "success") {
          const tables: TableItem[] = result?.tables || [];
          tablesCache.set(schemaKey, tables);
          return tables;
        } else {
          throw new Error("Failed to load tables");
        }
      })();

      inFlightRequests.set(schemaKey, requestPromise);
      const tables = await requestPromise;
      setAvailableTables(tables);
      console.log(`📊 Loaded ${tables.length} tables (schema: ${schemaKey})`);
    } catch (err: any) {
      setError(err.message || "Failed to load tables");
      console.error("❌ Failed to load tables:", err);
    } finally {
      inFlightRequests.delete(String(connectionConfig.schema || "default"));
      setLoading(false);
    }
  };

  const handleTableSelect = (table: TableItem) => {
    onTableChange(table, table);
    setShowBrowser(false);
  };

  const filteredTables = availableTables.filter((table) =>
    table.toLowerCase().includes(searchTerm.toLowerCase())
  );
 

  // Compact variant for embedding in cards
  if (variant === "compact") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {/* {connectionStatus === "connected" ? ( */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={disabled || loading}
                className="flex items-center space-x-2 w-full justify-between min-w-0"
              >
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <Table2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm truncate font-medium">
                    {currentTable || "Select Table"}
                  </span>
                </div>
                <div className="flex-shrink-0 ml-2">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className={menuWidth || "w-64"}
              align="start"
            >
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Available Tables</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadTables}
                  disabled={loading}
                  className="h-6 w-6 p-0"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {error ? (
                <DropdownMenuItem
                  disabled
                  className="text-red-600 text-xs"
                >
                  <AlertCircle className="h-3 w-3 mr-2" />
                  {error}
                </DropdownMenuItem>
              ) : filteredTables.length > 0 ? (
                <div className="max-h-48 overflow-y-auto">
                  {filteredTables.slice(0, 10).map((table) => (
                    <DropdownMenuItem
                      key={table}
                      onClick={() => handleTableSelect(table)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <Table2 className="h-3 w-3 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-medium text-xs truncate">
                            {table}
                          </div>
                        </div>
                      </div>
                      {currentTable === table && (
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  {filteredTables.length > 10 && (
                    <DropdownMenuItem
                      onClick={() => setShowBrowser(true)}
                      className="justify-center text-blue-600"
                    >
                      <Search className="h-3 w-3 mr-2" />
                      View All Tables
                    </DropdownMenuItem>
                  )}
                </div>
              ) : (
                <DropdownMenuItem
                  disabled
                  className="text-gray-500 text-xs"
                >
                  <Database className="h-3 w-3 mr-2" />
                  No tables found
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        {/* ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            className="w-full flex items-center space-x-2"
          >
            <AlertCircle className="h-4 w-4 text-orange-500 flex-shrink-0" />
            <span className="text-sm font-medium">Not Connected</span>
          </Button>
        )} */}

        {/* Table Browser Dialog */}
        <Dialog open={showBrowser} onOpenChange={setShowBrowser}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-600" />
                  <span>Select ClickHouse Table</span>
                </div>
              </DialogTitle>
              <DialogDescription>
                Choose a table from your ClickHouse database to map to this cube
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Tables List */}
              <div className="h-[400px] border rounded-lg overflow-y-auto">
                <div className="p-2 space-y-1">
                  {filteredTables.map((table) => (
                    <Card
                      key={table}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        currentTable === table
                          ? "ring-2 ring-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleTableSelect(table)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Table2 className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-medium">{table}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredTables.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No tables found matching your search</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Full variant (for expanded views)
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5 text-blue-600" />
          <span>Table Mapping</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadTables}
            disabled={loading || connectionStatus !== "connected"}
            className="flex-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Load Tables
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBrowser(true)}
            disabled={availableTables.length === 0}
          >
            <Search className="h-4 w-4 mr-2" />
            Browse
          </Button>
        </div>

        {currentTable && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <Table2 className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">{currentTable}</div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
