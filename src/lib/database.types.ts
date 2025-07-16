export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  deebee_dms: {
    Tables: {
      dual: {
        Row: {
          dummy: string
        }
        Insert: {
          dummy: string
        }
        Update: {
          dummy?: string
        }
        Relationships: []
      }
      organization_settings: {
        Row: {
          id: number
          organization_id: number
          settings_key: string
          settings_section: string
          settings_value: string
        }
        Insert: {
          id?: number
          organization_id: number
          settings_key: string
          settings_section: string
          settings_value: string
        }
        Update: {
          id?: number
          organization_id?: number
          settings_key?: string
          settings_section?: string
          settings_value?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organizations"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_themes: {
        Row: {
          css_text: string
          id: number
          organization_id: number
          theme_name: string
        }
        Insert: {
          css_text: string
          id?: number
          organization_id: number
          theme_name: string
        }
        Update: {
          css_text?: string
          id?: number
          organization_id?: number
          theme_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_themes_organizations"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          favicon_url: string | null
          id: number
          is_default: boolean
          logo_url: string | null
          organization_identifier: string
          organization_name: string
        }
        Insert: {
          favicon_url?: string | null
          id?: number
          is_default?: boolean
          logo_url?: string | null
          organization_identifier: string
          organization_name: string
        }
        Update: {
          favicon_url?: string | null
          id?: number
          is_default?: boolean
          logo_url?: string | null
          organization_identifier?: string
          organization_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_user_by_email: {
        Args: { v_email: string }
        Returns: {
          id: string
          email: string
          phone: string
          email_confirmed: boolean
          phone_confirmed: boolean
        }[]
      }
      get_auth_user_by_id: {
        Args: { v_id: string }
        Returns: {
          id: string
          email: string
          phone: string
          email_confirmed: boolean
          phone_confirmed: boolean
        }[]
      }
      get_auth_user_by_phone: {
        Args: { v_phone: string }
        Returns: {
          id: string
          email: string
          phone: string
          email_confirmed: boolean
          phone_confirmed: boolean
        }[]
      }
      get_auth_user_identities_by_email: {
        Args: { v_email: string }
        Returns: {
          provider_id: string
          user_id: string
          identity_data: string
          provider: string
        }[]
      }
      get_auth_user_identities_by_id: {
        Args: { v_user_id: string }
        Returns: {
          provider_id: string
          user_id: string
          identity_data: string
          provider: string
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
  deebee_dms: {
    Enums: {},
  },
} as const

