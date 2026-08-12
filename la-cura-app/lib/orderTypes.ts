export const ORDER_CATEGORIES = [
  "Pharmacy",
  "Diagnostic",
  "Laboratory",
  "Diet",
  "Supplement",
  "Enteral Feed",
  "Other",
] as const;


export type OrderCategory =
  (typeof ORDER_CATEGORIES)[number];


export type OrderStatus =
  | "Active"
  | "Held"
  | "Discontinued"
  | "Completed";


export type ResidentOrder = {
  id: number;

  resident_id: number;
  resident_name: string;

  category: OrderCategory;

  order_name: string;

  dosage?: string | null;
  directions?: string | null;
  order_type?: string | null;
  route?: string | null;

  order_date?: string | null;

  communication_method?:
    | string
    | null;

  ordered_by?:
    | string
    | null;

  schedule_type?:
    | string
    | null;

  frequency?:
    | string
    | null;

  administration_time?:
    | string
    | null;

  indication?:
    | string
    | null;

  priority?:
    | string
    | null;

  specimen?:
    | string
    | null;

  source?:
    | string
    | null;

  pharmacy?:
    | string
    | null;

  start_date?:
    | string
    | null;

  end_date?:
    | string
    | null;

  review_date?:
    | string
    | null;

  status: OrderStatus;

  revision_number: number;

  revision_date?:
    | string
    | null;

  medication_id?:
    | number
    | null;

  notes?:
    | string
    | null;

  metadata?:
    | Record<
        string,
        unknown
      >
    | null;

  created_by?:
    | string
    | null;

  created_at?:
    | string
    | null;

  updated_at?:
    | string
    | null;
};


export type OrderHistoryRecord = {
  id: number;
  order_id: number;
  action: string;

  previous_status?:
    | string
    | null;

  new_status?:
    | string
    | null;

  note?:
    | string
    | null;

  changed_by: string;

  snapshot?:
    | Record<
        string,
        unknown
      >
    | null;

  changed_at: string;
};
