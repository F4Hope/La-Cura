"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronDown,
  LoaderCircle,
  RefreshCw,
  Search,
} from "lucide-react";

import OrderEntryModal from "@/components/orders/OrderEntryModal";

import {
  ORDER_CATEGORIES,
  type OrderCategory,
  type OrderHistoryRecord,
  type OrderStatus,
  type ResidentOrder,
} from "@/lib/orderTypes";

import {
  supabase,
} from "@/lib/supabase/client";


type Props = {
  residentId: number;
  residentName: string;
  primaryDoctor?: string;
};


const PAGE_SIZE = 12;


function cleanText(
  value: unknown
) {
  return typeof value ===
    "string"
    ? value.trim()
    : "";
}


function formatDate(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}


function formatDateTime(
  value:
    | string
    | null
    | undefined
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}


function statusClass(
  status:
    OrderStatus
) {
  switch (status) {
    case "Held":
      return "text-amber-700";

    case "Discontinued":
      return "text-red-700";

    case "Completed":
      return "text-blue-700";

    default:
      return "text-[#234E3D]";
  }
}


export default function ResidentOrdersTab({
  residentId,
  residentName,
  primaryDoctor = "",
}: Props) {
  const [
    orders,
    setOrders,
  ] = useState<
    ResidentOrder[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("All");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("Active");

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    newMenuOpen,
    setNewMenuOpen,
  ] = useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<OrderCategory | null>(
      null
    );

  const [
    editingOrder,
    setEditingOrder,
  ] =
    useState<ResidentOrder | null>(
      null
    );

  const [
    viewingOrder,
    setViewingOrder,
  ] =
    useState<ResidentOrder | null>(
      null
    );

  const [
    historyOrder,
    setHistoryOrder,
  ] =
    useState<ResidentOrder | null>(
      null
    );

  const [
    history,
    setHistory,
  ] = useState<
    OrderHistoryRecord[]
  >([]);

  const [
    historyLoading,
    setHistoryLoading,
  ] = useState(false);


  const loadOrders =
    useCallback(
      async (
        quiet = false
      ) => {
        if (quiet) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }

        setError("");


        try {
          const {
            data,
            error:
              loadError,
          } =
            await supabase
              .from("orders")
              .select("*")
              .eq(
                "resident_id",
                residentId
              )
              .order(
                "order_date",
                {
                  ascending:
                    false,
                }
              );


          if (loadError) {
            throw loadError;
          }


          setOrders(
            (data ??
              []) as ResidentOrder[]
          );
        } catch (
          caughtError
        ) {
          console.error(
            "Unable to load resident orders:",
            caughtError
          );

          setError(
            caughtError instanceof
            Error
              ? caughtError.message
              : "Resident orders could not be loaded."
          );
        } finally {
          setLoading(false);
          setRefreshing(
            false
          );
        }
      },
      [
        residentId,
      ]
    );


  useEffect(() => {
    void loadOrders();
  }, [
    loadOrders,
  ]);


  useEffect(() => {
    setPage(1);
  }, [
    search,
    categoryFilter,
    statusFilter,
  ]);


  const nextOrderReview =
    useMemo(() => {
      const dates =
        orders
          .filter(
            (order) =>
              order.status ===
                "Active" &&
              order.review_date
          )
          .map(
            (order) =>
              new Date(
                order.review_date as string
              )
          )
          .filter(
            (date) =>
              !Number.isNaN(
                date.getTime()
              )
          )
          .sort(
            (a, b) =>
              a.getTime() -
              b.getTime()
          );

      return dates[0] ??
        null;
    }, [
      orders,
    ]);


  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();


      return orders.filter(
        (order) => {
          const matchesCategory =
            categoryFilter ===
              "All" ||
            order.category ===
              categoryFilter;


          const matchesStatus =
            statusFilter ===
              "All" ||
            order.status ===
              statusFilter;


          const matchesSearch =
            !query ||
            [
              order.order_name,
              order.directions,
              order.category,
              order.status,
              order.dosage,
              order.route,
              order.frequency,
              order.ordered_by,
            ].some(
              (value) =>
                cleanText(
                  value
                )
                  .toLowerCase()
                  .includes(
                    query
                  )
            );


          return (
            matchesCategory &&
            matchesStatus &&
            matchesSearch
          );
        }
      );
    }, [
      orders,
      search,
      categoryFilter,
      statusFilter,
    ]);


  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
          PAGE_SIZE
      )
    );


  const visibleOrders =
    filtered.slice(
      (page - 1) *
        PAGE_SIZE,
      page * PAGE_SIZE
    );


  async function changeStatus(
    order:
      ResidentOrder,
    status:
      OrderStatus
  ) {
    const message =
      status ===
      "Discontinued"
        ? `Discontinue "${order.order_name}"?`
        : status ===
            "Held"
          ? `Place "${order.order_name}" on hold?`
          : status ===
              "Completed"
            ? `Mark "${order.order_name}" completed?`
            : `Resume "${order.order_name}"?`;


    if (
      !window.confirm(
        message
      )
    ) {
      return;
    }


    const {
      error:
        actionError,
    } =
      await supabase.rpc(
        "la_cura_set_order_status",
        {
          p_order_id:
            order.id,

          p_status:
            status,

          p_note:
            null,
        }
      );


    if (actionError) {
      window.alert(
        actionError.message
      );

      return;
    }


    await loadOrders(
      true
    );
  }


  async function openHistory(
    order:
      ResidentOrder
  ) {
    setHistoryOrder(
      order
    );

    setHistory([]);
    setHistoryLoading(
      true
    );


    const {
      data,
      error:
        historyError,
    } =
      await supabase
        .from(
          "order_history"
        )
        .select("*")
        .eq(
          "order_id",
          order.id
        )
        .order(
          "changed_at",
          {
            ascending:
              false,
          }
        );


    if (historyError) {
      setHistory([]);
    } else {
      setHistory(
        (data ??
          []) as OrderHistoryRecord[]
      );
    }


    setHistoryLoading(
      false
    );
  }


  function handleAction(
    order:
      ResidentOrder,
    value: string
  ) {
    if (
      value === "view"
    ) {
      setViewingOrder(
        order
      );

      return;
    }


    if (
      value === "edit"
    ) {
      setEditingOrder(
        order
      );

      setSelectedCategory(
        order.category
      );

      return;
    }


    if (
      value === "hold"
    ) {
      void changeStatus(
        order,
        "Held"
      );

      return;
    }


    if (
      value === "resume"
    ) {
      void changeStatus(
        order,
        "Active"
      );

      return;
    }


    if (
      value ===
      "discontinue"
    ) {
      void changeStatus(
        order,
        "Discontinued"
      );

      return;
    }


    if (
      value ===
      "complete"
    ) {
      void changeStatus(
        order,
        "Completed"
      );

      return;
    }


    if (
      value === "history"
    ) {
      void openHistory(
        order
      );
    }
  }


  if (loading) {
    return (
      <div className="flex min-h-[260px] items-center justify-center bg-white">
        <LoaderCircle
          size={20}
          className="animate-spin text-[#073B2F]"
        />
      </div>
    );
  }


  return (
    <>
      <div className="bg-white">
        {/* PCC-LIKE ORDER TOOLBAR */}

        <div className="border-b border-[#6E815C] bg-[#8FA47A] px-2 py-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setNewMenuOpen(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                  className="inline-flex h-7 items-center gap-1 border border-[#58694A] bg-white px-2.5 text-[10px] font-bold text-[#243A30]"
                >
                  New

                  <ChevronDown
                    size={11}
                  />
                </button>


                {newMenuOpen && (
                  <div className="absolute left-0 top-7 z-30 min-w-[145px] border border-[#9AA69E] bg-white shadow-lg">
                    {ORDER_CATEGORIES.map(
                      (
                        category
                      ) => (
                        <button
                          key={
                            category
                          }
                          type="button"
                          onClick={() => {
                            setNewMenuOpen(
                              false
                            );

                            setEditingOrder(
                              null
                            );

                            setSelectedCategory(
                              category
                            );
                          }}
                          className="block w-full border-b border-[#E2E6E3] px-2.5 py-1.5 text-left text-[10px] font-semibold text-[#273C33] last:border-b-0 hover:bg-[#EEF2EF]"
                        >
                          {category}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>


              <span className="text-[10px] font-semibold text-white/90">
                -or-
              </span>


              <div className="relative min-w-[240px] flex-1 sm:max-w-[420px]">
                <Search
                  size={11}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-[#6A776F]"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Type to search orders..."
                  className="h-7 w-full border border-[#788A6D] bg-white pl-7 pr-2 text-[10px] outline-none"
                />
              </div>
            </div>


            <button
              type="button"
              disabled={
                refreshing
              }
              onClick={() =>
                void loadOrders(
                  true
                )
              }
              className="inline-flex h-7 items-center gap-1 border border-[#58694A] bg-white px-2.5 text-[10px] font-bold text-[#243A30] disabled:opacity-50"
            >
              <RefreshCw
                size={10}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh Order List
            </button>
          </div>
        </div>


        {/* REVIEW / FILTER ROW */}

        <div className="flex flex-col gap-2 border-b border-[#7D906B] bg-[#A0B286] px-2 py-1.5 text-[10px] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={
                categoryFilter
              }
              onChange={(
                event
              ) =>
                setCategoryFilter(
                  event.target
                    .value
                )
              }
              className="h-6 border border-[#748368] bg-white px-1.5 text-[10px]"
            >
              <option>
                All
              </option>

              {ORDER_CATEGORIES.map(
                (
                  category
                ) => (
                  <option
                    key={
                      category
                    }
                  >
                    {category}
                  </option>
                )
              )}
            </select>


            <select
              value={
                statusFilter
              }
              onChange={(
                event
              ) =>
                setStatusFilter(
                  event.target
                    .value
                )
              }
              className="h-6 border border-[#748368] bg-white px-1.5 text-[10px]"
            >
              <option>
                All
              </option>

              <option>
                Active
              </option>

              <option>
                Held
              </option>

              <option>
                Discontinued
              </option>

              <option>
                Completed
              </option>
            </select>
          </div>


          <p className="font-semibold text-[#26382F]">
            Next Order Review:{" "}
            <strong>
              {nextOrderReview
                ? formatDate(
                    nextOrderReview.toISOString()
                  )
                : "Not scheduled"}
            </strong>
          </p>
        </div>


        {error && (
          <div className="border-b border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">
            {error}
          </div>
        )}


        {/* PAGINATION TOP */}

        <div className="flex items-center justify-center gap-1 border-b border-[#D7DEDA] bg-[#F4F4F0] px-2 py-1">
          <button
            type="button"
            disabled={
              page <= 1
            }
            onClick={() =>
              setPage(
                Math.max(
                  1,
                  page - 1
                )
              )
            }
            className="h-6 border border-[#ADB8B2] bg-white px-2 text-[9px] font-bold disabled:opacity-40"
          >
            Prev
          </button>

          <span className="px-2 text-[9px] font-semibold text-[#4A5B53]">
            Page {page} of{" "}
            {totalPages}
          </span>

          <button
            type="button"
            disabled={
              page >=
              totalPages
            }
            onClick={() =>
              setPage(
                Math.min(
                  totalPages,
                  page + 1
                )
              )
            }
            className="h-6 border border-[#ADB8B2] bg-white px-2 text-[9px] font-bold disabled:opacity-40"
          >
            Next
          </button>
        </div>


        {/* ORDER TABLE */}

        {visibleOrders.length >
        0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] border-collapse">
              <thead>
                <tr className="bg-[#E5EEF4] text-[9px] font-bold text-[#233A31]">
                  <OrderHead>
                    Actions
                  </OrderHead>

                  <OrderHead>
                    Order
                  </OrderHead>

                  <OrderHead>
                    Directions
                  </OrderHead>

                  <OrderHead>
                    Category
                  </OrderHead>

                  <OrderHead>
                    Status
                  </OrderHead>

                  <OrderHead>
                    Start Date
                  </OrderHead>

                  <OrderHead>
                    End Date
                  </OrderHead>

                  <OrderHead>
                    Revision Date
                  </OrderHead>
                </tr>
              </thead>


              <tbody>
                {visibleOrders.map(
                  (
                    order,
                    index
                  ) => (
                    <tr
                      key={
                        order.id
                      }
                      className={`
                        border-b
                        border-[#D7DEDA]
                        text-[10px]

                        ${
                          index %
                            2 ===
                          0
                            ? "bg-white"
                            : "bg-[#FAFAF7]"
                        }
                      `}
                    >
                      <td className="w-[95px] border-r border-[#D7DEDA] px-1 py-1">
                        <select
                          value=""
                          onChange={(
                            event
                          ) => {
                            handleAction(
                              order,
                              event.target
                                .value
                            );

                            event.target
                              .value =
                              "";
                          }}
                          className="h-6 w-[84px] border border-[#AEB8B3] bg-white px-1 text-[9px] font-semibold text-[#174F75]"
                        >
                          <option value="">
                            Actions
                          </option>

                          <option value="view">
                            View Order
                          </option>

                          <option value="edit">
                            Edit / Revise
                          </option>

                          {order.status ===
                          "Held" ? (
                            <option value="resume">
                              Resume
                            </option>
                          ) : order.status ===
                            "Active" ? (
                            <option value="hold">
                              Hold
                            </option>
                          ) : null}

                          {order.status !==
                            "Discontinued" && (
                            <option value="discontinue">
                              Discontinue
                            </option>
                          )}

                          {order.status !==
                            "Completed" && (
                            <option value="complete">
                              Mark Completed
                            </option>
                          )}

                          <option value="history">
                            Revision History
                          </option>
                        </select>
                      </td>


                      <td className="max-w-[430px] border-r border-[#D7DEDA] px-2 py-1 font-medium text-[#26382F]">
                        <div className="leading-[1.25]">
                          <span className="font-semibold">
                            {order.order_name}
                          </span>

                          {order.dosage && (
                            <span className="ml-1 text-[#596A62]">
                              {order.dosage}
                            </span>
                          )}
                        </div>
                      </td>


                      <td className="max-w-[430px] border-r border-[#D7DEDA] px-2 py-1 leading-[1.25] text-[#34483F]">
                        {cleanText(
                          order.directions
                        ) ||
                          [
                            order.route,
                            order.frequency,
                            order.administration_time,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(
                              " • "
                            ) ||
                          "No directions specified"}
                      </td>


                      <td className="border-r border-[#D7DEDA] px-2 py-1">
                        {order.category}
                      </td>


                      <td
                        className={`border-r border-[#D7DEDA] px-2 py-1 font-semibold ${statusClass(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </td>


                      <td className="whitespace-nowrap border-r border-[#D7DEDA] px-2 py-1">
                        {formatDate(
                          order.start_date
                        )}
                      </td>


                      <td className="whitespace-nowrap border-r border-[#D7DEDA] px-2 py-1">
                        {formatDate(
                          order.end_date
                        )}
                      </td>


                      <td className="whitespace-nowrap px-2 py-1">
                        {formatDate(
                          order.revision_date
                        )}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-[11px] text-[#687970]">
            No orders match the selected filters.
          </div>
        )}
      </div>


      {/* ORDER ENTRY */}

      <OrderEntryModal
        open={
          Boolean(
            selectedCategory
          )
        }
        category={
          selectedCategory
        }
        residentId={
          residentId
        }
        residentName={
          residentName
        }
        primaryDoctor={
          primaryDoctor
        }
        initialOrder={
          editingOrder
        }
        onClose={() => {
          setSelectedCategory(
            null
          );

          setEditingOrder(
            null
          );
        }}
        onSaved={() =>
          void loadOrders(
            true
          )
        }
      />


      {/* VIEW ORDER */}

      {viewingOrder && (
        <SimpleModal
          title="Order Details"
          onClose={() =>
            setViewingOrder(
              null
            )
          }
        >
          <div className="grid gap-px bg-[#D8DFDB] sm:grid-cols-2">
            <Detail
              label="Order"
              value={
                viewingOrder.order_name
              }
            />

            <Detail
              label="Category"
              value={
                viewingOrder.category
              }
            />

            <Detail
              label="Status"
              value={
                viewingOrder.status
              }
            />

            <Detail
              label="Ordered By"
              value={
                viewingOrder.ordered_by
              }
            />

            <Detail
              label="Dosage"
              value={
                viewingOrder.dosage
              }
            />

            <Detail
              label="Route"
              value={
                viewingOrder.route
              }
            />

            <Detail
              label="Frequency"
              value={
                viewingOrder.frequency
              }
            />

            <Detail
              label="Administration Time"
              value={
                viewingOrder.administration_time
              }
            />

            <Detail
              label="Schedule Type"
              value={
                viewingOrder.schedule_type
              }
            />

            <Detail
              label="Start Date"
              value={
                formatDate(
                  viewingOrder.start_date
                )
              }
            />

            <Detail
              label="End Date"
              value={
                formatDate(
                  viewingOrder.end_date
                )
              }
            />

            <Detail
              label="Review Date"
              value={
                formatDate(
                  viewingOrder.review_date
                )
              }
            />
          </div>

          <div className="border-t border-[#D7DEDA] p-3">
            <p className="text-[9px] font-bold uppercase text-[#718078]">
              Directions
            </p>

            <p className="mt-1 whitespace-pre-wrap text-[11px] leading-5 text-[#34483F]">
              {cleanText(
                viewingOrder.directions
              ) ||
                "No directions recorded."}
            </p>
          </div>
        </SimpleModal>
      )}


      {/* HISTORY */}

      {historyOrder && (
        <SimpleModal
          title={`Revision History — ${historyOrder.order_name}`}
          onClose={() => {
            setHistoryOrder(
              null
            );

            setHistory([]);
          }}
        >
          {historyLoading ? (
            <div className="flex h-32 items-center justify-center">
              <LoaderCircle
                size={18}
                className="animate-spin text-[#073B2F]"
              />
            </div>
          ) : history.length >
            0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr className="bg-[#E7EDE9] text-[9px] font-bold uppercase text-[#40544B]">
                    <OrderHead>
                      Date / Time
                    </OrderHead>

                    <OrderHead>
                      Action
                    </OrderHead>

                    <OrderHead>
                      Previous
                    </OrderHead>

                    <OrderHead>
                      New
                    </OrderHead>

                    <OrderHead>
                      Staff
                    </OrderHead>
                  </tr>
                </thead>

                <tbody>
                  {history.map(
                    (
                      item
                    ) => (
                      <tr
                        key={
                          item.id
                        }
                        className="border-b border-[#DCE3DF] text-[10px]"
                      >
                        <td className="px-2 py-1.5">
                          {formatDateTime(
                            item.changed_at
                          )}
                        </td>

                        <td className="px-2 py-1.5 font-semibold">
                          {item.action}
                        </td>

                        <td className="px-2 py-1.5">
                          {item.previous_status ||
                            "—"}
                        </td>

                        <td className="px-2 py-1.5">
                          {item.new_status ||
                            "—"}
                        </td>

                        <td className="px-2 py-1.5">
                          {item.changed_by}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-[11px] text-[#687970]">
              No revision history is available.
            </div>
          )}
        </SimpleModal>
      )}
    </>
  );
}


function OrderHead({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="border-r border-[#BFCAD0] px-2 py-1 text-left last:border-r-0">
      {children}
    </th>
  );
}


function SimpleModal({
  title,
  children,
  onClose,
}: {
  title: string;

  children:
    React.ReactNode;

  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={
        onClose
      }
    >
      <div
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-[#AAB8B1] bg-white shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-[#8A9E78] bg-[#073B2F] px-3 py-2 text-white">
          <h2 className="text-[12px] font-bold">
            {title}
          </h2>

          <button
            type="button"
            onClick={
              onClose
            }
            className="h-7 border border-white/25 px-2 text-[10px] font-bold"
          >
            Close
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}


function Detail({
  label,
  value,
}: {
  label: string;

  value:
    | string
    | null
    | undefined;
}) {
  return (
    <div className="bg-white px-3 py-2">
      <p className="text-[9px] font-bold uppercase text-[#73817A]">
        {label}
      </p>

      <p className="mt-0.5 text-[11px] font-semibold text-[#33483F]">
        {cleanText(
          value
        ) || "—"}
      </p>
    </div>
  );
}
