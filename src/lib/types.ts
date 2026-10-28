export interface SitePage {
  slug: "home" | "about" | "join";
  title: string;
  subtitle: string;
  hero_intro: string;
  section_title: string;
  body: string;
  highlight_one_title?: string;
  highlight_one_body?: string;
  highlight_two_title?: string;
  highlight_two_body?: string;
  highlight_three_title?: string;
  highlight_three_body?: string;
  updated_at?: string;
}

export interface ClubEvent {
  id: string;
  title: string;
  event_type: string;
  event_date: string;
  event_time?: string | null;
  location?: string | null;
  summary?: string | null;
  details?: string | null;
  is_published?: boolean;
}

export interface BlogPost {
  id: string;
  batch_id: string;
  batch_name?: string;
  category: "material" | "announcement";
  title: string;
  body: string;
  is_published: boolean;
  file_name?: string | null;
  object_path?: string | null;
  content_type?: string | null;
  file_size?: number | null;
  created_at: string;
}

export interface TeamMember {
  full_name: string;
  team_role: string;
  position_title?: string | null;
  avatar_url?: string | null;
}

export interface BatchItem {
  id: string;
  batch_number: number;
  name: string;
  description?: string | null;
}

export interface StudentRosterItem {
  student_id: string;
  full_name: string;
}

export interface StudentDetail extends StudentRosterItem {
  class?: string;
  section?: string;
  roll?: number;
  date_of_birth?: string;
  gender?: string;
  student_contact_number?: string;
  email_address?: string;
  home_address?: string;
  guardians_name?: string;
  relationship_to_student?: string;
  guardians_contact_number?: string;
  created_at?: string;
}

export interface AdminActivityLogItem {
  id: number;
  record_type: string;
  record_id: string;
  action: string;
  changed_fields: string[];
  actor_email?: string;
  logged_at: string;
}

