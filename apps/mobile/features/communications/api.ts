import type { ApiCollectionResponse, Communication, RelatedEntityType } from '@crm/types';
import { apiClient } from '@/lib/api/client';

export interface ListCommunicationsParams {
  relatedEntityType: RelatedEntityType;
  relatedEntityId: string;
  pageSize?: number;
}

/** Read-only: mobile has no compose/send UI - communications are viewed as history on an entity's profile. */
export const communicationsApi = {
  async list(params: ListCommunicationsParams): Promise<ApiCollectionResponse<Communication>> {
    const { data } = await apiClient.get<ApiCollectionResponse<Communication>>('/communications', { params });
    return data;
  },
};
