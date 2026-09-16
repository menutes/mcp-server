export interface Recording {
  id: string;
  meetingTitle: string | null;
  status: "UPLOADING" | "PROCESSING" | "COMPLETED" | "FAILED";
  duration: number | null;
  speakerCount: number | null;
  sharingScope: string;
  createdAt: string;
  updatedAt: string;
  processingPhase: string | null;
  sourceType: string;
  user: { id: string; name: string | null };
  team: { id: string; name: string } | null;
  isOwner: boolean;
}

export interface RecordingContent {
  transcription: string | null;
  /// Legacy Enhanced summary HTML. Always the original auto-detected language
  /// variant, regardless of what the user picked in-app. Use `activeSummary`
  /// when you want "what the user sees": falls back to this when null.
  summary: string | null;
  /// HTML of the active (template, language) variant the user last picked in
  /// the native app, when it's COMPLETE and non-empty. null when the user is
  /// still on the original auto/legacy summary.
  activeSummary: string | null;
  activeTemplateId: string | null;
  activeSummaryLanguage: string | null;
  transcriptSegments: {
    speaker: string;
    text: string;
    startTime: number | null;
    endTime: number | null;
  }[];
  speakerNames: Record<string, string>;
  notes: string | null;
}

export interface ListRecordingsResponse {
  recordings: Recording[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface SearchResponse {
  recordings: Recording[];
  total: number;
}

export class MenutesApiClient {
  constructor(
    private baseUrl: string,
    private apiKey: string,
  ) {}

  private async request<T>(
    path: string,
    params?: Record<string, string | number>,
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: AbortSignal.timeout(30_000),
      });
    } catch {
      throw new Error(`Could not connect to Menutes API at ${this.baseUrl}`);
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Invalid API key. Check your MENUTES_API_KEY.");
      }
      if (response.status === 403) {
        throw new Error("You don't have access to this recording.");
      }
      if (response.status === 404) {
        throw new Error("Recording not found.");
      }
      if (response.status === 429) {
        throw new Error(
          "Rate limit exceeded (1000 req/hour). Try again later.",
        );
      }
      const body = await response.text();
      let message: string;
      try {
        message = JSON.parse(body).error || body;
      } catch {
        message = body || `HTTP ${response.status}`;
      }
      throw new Error(`Menutes API error: ${message}`);
    }

    return (await response.json()) as T;
  }

  async listRecordings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    view?: string;
  }): Promise<ListRecordingsResponse> {
    return this.request("/api/v1/recordings", params as Record<string, string | number>);
  }

  async getRecording(id: string): Promise<Recording> {
    return this.request(`/api/v1/recordings/${encodeURIComponent(id)}`);
  }

  async getRecordingContent(id: string): Promise<RecordingContent> {
    return this.request(
      `/api/v1/recordings/${encodeURIComponent(id)}/content`,
    );
  }

  async searchRecordings(
    query: string,
    limit?: number,
  ): Promise<SearchResponse> {
    const params: Record<string, string | number> = { q: query };
    if (limit !== undefined) params.limit = limit;
    return this.request("/api/v1/recordings/search", params);
  }
}
