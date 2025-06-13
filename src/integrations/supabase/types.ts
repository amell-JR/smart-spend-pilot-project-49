export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      budgets: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          currency_id: string
          id: string
          period: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          currency_id: string
          id?: string
          period?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          currency_id?: string
          id?: string
          period?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_budgets_categories"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_budgets_currencies"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string | null
          decimal_places: number | null
          id: string
          name: string
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string | null
          decimal_places?: number | null
          id?: string
          name: string
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string | null
          decimal_places?: number | null
          id?: string
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          created_at: string | null
          date: string | null
          from_currency_id: string
          id: string
          rate: number
          to_currency_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string | null
          from_currency_id: string
          id?: string
          rate: number
          to_currency_id: string
        }
        Update: {
          created_at?: string | null
          date?: string | null
          from_currency_id?: string
          id?: string
          rate?: number
          to_currency_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_exchange_rates_from_currency"
            columns: ["from_currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_exchange_rates_to_currency"
            columns: ["to_currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          currency_id: string
          date: string
          description: string
          id: string
          notes: string | null
          receipt_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          currency_id: string
          date: string
          description: string
          id?: string
          notes?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          currency_id?: string
          date?: string
          description?: string
          id?: string
          notes?: string | null
          receipt_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_expenses_categories"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_expenses_currencies"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          currency_id: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency_id: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency_id?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_currencies"
            columns: ["currency_id"]
            isOneToOne: false
            referencedRelation: "currencies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_budget_spent_amounts: {
        Args: { user_uuid: string }
        Returns: {
          category_id: string
          spent_amount: number
        }[]
      }
      get_category_spending_trend: {
        Args: { user_uuid: string; months_back?: number }
        Returns: {
          month_year: string
          category_name: string
          total_spent: number
        }[]
      }
      get_monthly_spending_summary: {
        Args: { user_uuid: string; target_year?: number; target_month?: number }
        Returns: {
          category_name: string
          category_color: string
          total_spent: number
          expense_count: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
