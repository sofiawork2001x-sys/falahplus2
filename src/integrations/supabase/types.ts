export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ain_defla_stats: {
        Row: {
          area_hectares: number
          created_at: string
          crop_name: string
          crops_count: number
          id: string
          notes: string
          updated_at: string
        }
        Insert: {
          area_hectares?: number
          created_at?: string
          crop_name: string
          crops_count?: number
          id?: string
          notes?: string
          updated_at?: string
        }
        Update: {
          area_hectares?: number
          created_at?: string
          crop_name?: string
          crops_count?: number
          id?: string
          notes?: string
          updated_at?: string
        }
        Relationships: []
      }
      consultation_replies: {
        Row: {
          author_id: string
          body: string
          consultation_id: string
          created_at: string
          id: string
        }
        Insert: {
          author_id: string
          body: string
          consultation_id: string
          created_at?: string
          id?: string
        }
        Update: {
          author_id?: string
          body?: string
          consultation_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_replies_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          body: string
          created_at: string
          farmer_id: string
          id: string
          images: Json
          status: Database["public"]["Enums"]["consultation_status"]
          title: string
          type: Database["public"]["Enums"]["consultation_type"]
          wilaya_code: number | null
        }
        Insert: {
          body: string
          created_at?: string
          farmer_id: string
          id?: string
          images?: Json
          status?: Database["public"]["Enums"]["consultation_status"]
          title: string
          type: Database["public"]["Enums"]["consultation_type"]
          wilaya_code?: number | null
        }
        Update: {
          body?: string
          created_at?: string
          farmer_id?: string
          id?: string
          images?: Json
          status?: Database["public"]["Enums"]["consultation_status"]
          title?: string
          type?: Database["public"]["Enums"]["consultation_type"]
          wilaya_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_wilaya_code_fkey"
            columns: ["wilaya_code"]
            isOneToOne: false
            referencedRelation: "wilayas"
            referencedColumns: ["code"]
          },
        ]
      }
      crop_diseases: {
        Row: {
          created_at: string
          id: string
          name: string
          season: string
          symptoms: string
          treatment: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          season?: string
          symptoms?: string
          treatment?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          season?: string
          symptoms?: string
          treatment?: string
          updated_at?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          category: string | null
          company_id: string
          created_at: string
          description: string
          id: string
          images: Json
          name: string
          price: string
          status: Database["public"]["Enums"]["listing_status"]
          wilaya_code: number | null
        }
        Insert: {
          category?: string | null
          company_id: string
          created_at?: string
          description?: string
          id?: string
          images?: Json
          name: string
          price: string
          status?: Database["public"]["Enums"]["listing_status"]
          wilaya_code?: number | null
        }
        Update: {
          category?: string | null
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          images?: Json
          name?: string
          price?: string
          status?: Database["public"]["Enums"]["listing_status"]
          wilaya_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_wilaya_code_fkey"
            columns: ["wilaya_code"]
            isOneToOne: false
            referencedRelation: "wilayas"
            referencedColumns: ["code"]
          },
        ]
      }
      farmers: {
        Row: {
          crop_type: string | null
          id: number
          name: string
          phone: string | null
          wilaya_id: number | null
        }
        Insert: {
          crop_type?: string | null
          id?: number
          name: string
          phone?: string | null
          wilaya_id?: number | null
        }
        Update: {
          crop_type?: string | null
          id?: number
          name?: string
          phone?: string | null
          wilaya_id?: number | null
        }
        Relationships: []
      }
      financial_requests: {
        Row: {
          amount: string | null
          created_at: string
          details: string
          farmer_id: string
          files: Json
          id: string
          kind: Database["public"]["Enums"]["financial_kind"]
          reviewer_id: string | null
          reviewer_note: string | null
          status: Database["public"]["Enums"]["financial_status"]
          title: string
        }
        Insert: {
          amount?: string | null
          created_at?: string
          details?: string
          farmer_id: string
          files?: Json
          id?: string
          kind: Database["public"]["Enums"]["financial_kind"]
          reviewer_id?: string | null
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["financial_status"]
          title: string
        }
        Update: {
          amount?: string | null
          created_at?: string
          details?: string
          farmer_id?: string
          files?: Json
          id?: string
          kind?: Database["public"]["Enums"]["financial_kind"]
          reviewer_id?: string | null
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["financial_status"]
          title?: string
        }
        Relationships: []
      }
      lands_rent: {
        Row: {
          area_hectares: number
          city: string | null
          created_at: string
          description: string
          farmer_id: string
          id: string
          images: Json
          price: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          wilaya_code: number | null
        }
        Insert: {
          area_hectares: number
          city?: string | null
          created_at?: string
          description?: string
          farmer_id: string
          id?: string
          images?: Json
          price: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          wilaya_code?: number | null
        }
        Update: {
          area_hectares?: number
          city?: string | null
          created_at?: string
          description?: string
          farmer_id?: string
          id?: string
          images?: Json
          price?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          wilaya_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lands_rent_wilaya_code_fkey"
            columns: ["wilaya_code"]
            isOneToOne: false
            referencedRelation: "wilayas"
            referencedColumns: ["code"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          wilaya: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id: string
          phone?: string | null
          wilaya?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          wilaya?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weather: {
        Row: {
          condition: string | null
          id: number
          temp_celsius: number | null
          updated_at: string | null
          wilaya_id: number | null
        }
        Insert: {
          condition?: string | null
          id?: number
          temp_celsius?: number | null
          updated_at?: string | null
          wilaya_id?: number | null
        }
        Update: {
          condition?: string | null
          id?: number
          temp_celsius?: number | null
          updated_at?: string | null
          wilaya_id?: number | null
        }
        Relationships: []
      }
      weather_alerts: {
        Row: {
          active: boolean
          author_id: string
          created_at: string
          id: string
          message: string
          severity: string
        }
        Insert: {
          active?: boolean
          author_id: string
          created_at?: string
          id?: string
          message: string
          severity?: string
        }
        Update: {
          active?: boolean
          author_id?: string
          created_at?: string
          id?: string
          message?: string
          severity?: string
        }
        Relationships: []
      }
      wilayas: {
        Row: {
          code: number
          name_ar: string
          name_fr: string
          total_farms: number | null
        }
        Insert: {
          code: number
          name_ar: string
          name_fr: string
          total_farms?: number | null
        }
        Update: {
          code?: number
          name_ar?: string
          name_fr?: string
          total_farms?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expert_role_for_type: {
        Args: { _t: Database["public"]["Enums"]["consultation_type"] }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "farmer"
        | "company"
        | "agri_expert"
        | "finance_expert"
        | "vet"
        | "admin"
      consultation_status: "open" | "answered" | "closed"
      consultation_type: "technical" | "vet" | "financial"
      financial_kind: "feasibility" | "support_file"
      financial_status: "pending" | "approved" | "rejected"
      listing_status: "active" | "rented" | "hidden"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "farmer",
        "company",
        "agri_expert",
        "finance_expert",
        "vet",
        "admin",
      ],
      consultation_status: ["open", "answered", "closed"],
      consultation_type: ["technical", "vet", "financial"],
      financial_kind: ["feasibility", "support_file"],
      financial_status: ["pending", "approved", "rejected"],
      listing_status: ["active", "rented", "hidden"],
    },
  },
} as const
