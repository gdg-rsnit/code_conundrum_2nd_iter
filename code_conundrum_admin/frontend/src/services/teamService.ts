import api from "../lib/axios.js";

import {
    getTeamsResponseSchema,
    teamItemResponseSchema,
    updateTeamStatusSchema,
    type GetTeamsResponse,
    type TeamItemResponse,
    type UpdateTeamStatusInput,
} from "../../../schemas/teamSchema.js";
import {
    createPenaltySchema,
    penaltiesListResponseSchema,
    penaltyItemResponseSchema,
    type CreatePenaltyInput,
    type PenaltiesListResponse,
    type PenaltyItemResponse,
} from "../../../schemas/penaltySchema.js";

export const getAllTeamsRequest = async (): Promise<GetTeamsResponse> => {
    const { data } = await api.get("/admin/teams");
    const validation = getTeamsResponseSchema.safeParse(data);
    if (!validation.success) {
        throw validation.error;
    }
    return validation.data;
};

export const getBannedTeamsRequest = async (): Promise<GetTeamsResponse> => {
    const { data } = await api.get("/admin/teams/banned");
    const validation = getTeamsResponseSchema.safeParse(data);
    if (!validation.success) {
        throw validation.error;
    }
    return validation.data;
};

export const updateTeamStatusRequest = async (
    teamId: string,
    banned: boolean
): Promise<TeamItemResponse> => {
    const inputValidation = updateTeamStatusSchema.safeParse({ banned });
    if (!inputValidation.success) {
        throw inputValidation.error;
    }
    const { data } = await api.patch(`/admin/teams/${teamId}/status`, inputValidation.data);
    const responseValidation = teamItemResponseSchema.safeParse(data);
    if (!responseValidation.success) {
        throw responseValidation.error;
    }
    return responseValidation.data;
};

export const penalizeTeamsRequest = async (
    teamId: string,
    payload: Omit<CreatePenaltyInput, "teamId">
): Promise<PenaltyItemResponse> => {
    const inputValidation = createPenaltySchema.safeParse({
        teamId,
        ...payload,
    });
    if (!inputValidation.success) {
        throw inputValidation.error;
    }

    const { data } = await api.post(`/admin/teams/${teamId}/penalties`, inputValidation.data);
    const responseValidation = penaltyItemResponseSchema.safeParse(data);
    if (!responseValidation.success) {
        throw responseValidation.error;
    }
    return responseValidation.data;
};

export const getPenalizedTeamsRequest = async (): Promise<PenaltiesListResponse> => {
    const { data } = await api.get("/admin/teams/penalties/all");
    const validation = penaltiesListResponseSchema.safeParse(data);
    if (!validation.success) {
        throw validation.error;
    }
    return validation.data;
};

export const deletePenaltyRequest = async (
    penaltyId: string
): Promise<PenaltyItemResponse> => {
    const { data } = await api.delete(`/admin/teams/penalties/${penaltyId}`);
    const validation = penaltyItemResponseSchema.safeParse(data);
    if (!validation.success) {
        throw validation.error;
    }
    return validation.data;
};