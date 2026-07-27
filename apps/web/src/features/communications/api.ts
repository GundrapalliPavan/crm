import type {
  ApiCollectionResponse,
  Communication,
  CommunicationChannel,
  CommunicationStatus,
  CommunicationTemplate,
  CreateCommunicationRequest,
  CreateCommunicationTemplateRequest,
  RelatedEntityType,
  TemplateStatus,
  UpdateCommunicationTemplateRequest,
} from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListCommunicationsParams {
  page?: number;
  pageSize?: number;
  channel?: CommunicationChannel;
  status?: CommunicationStatus;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ListCommunicationTemplatesParams {
  page?: number;
  pageSize?: number;
  channel?: CommunicationChannel;
  status?: TemplateStatus;
}

export const communicationsApi = {
  async list(params: ListCommunicationsParams): Promise<ApiCollectionResponse<Communication>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Communication>>('/communications', { params });
    return data;
  },

  async create(request: CreateCommunicationRequest): Promise<Communication> {
    const { data } = await apiClient.post<Communication>('/communications', request);
    return data;
  },

  async listTemplates(params: ListCommunicationTemplatesParams): Promise<ApiCollectionResponse<CommunicationTemplate>> {
    const { data } = await apiClient.get<ApiCollectionResponse<CommunicationTemplate>>('/communication-templates', {
      params,
    });
    return data;
  },

  async createTemplate(request: CreateCommunicationTemplateRequest): Promise<CommunicationTemplate> {
    const { data } = await apiClient.post<CommunicationTemplate>('/communication-templates', request);
    return data;
  },

  async updateTemplate(id: string, request: UpdateCommunicationTemplateRequest): Promise<CommunicationTemplate> {
    const { data } = await apiClient.patch<CommunicationTemplate>(`/communication-templates/${id}`, request);
    return data;
  },
};
