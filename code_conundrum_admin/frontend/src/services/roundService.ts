import api from "../lib/axios.js";
import {
	createRoundSchema,
	extendRoundSchema,
	roundActionResponseSchema,
	roundItemResponseSchema,
	roundsListResponseSchema,
	updateRoundSchema,
	type CreateRoundInput,
	type ExtendRoundInput,
	type RoundActionResponse,
	type RoundItemResponse,
	type RoundsListResponse,
	type UpdateRoundInput,
} from "../../../schemas/roundSchema.js";

export const getRoundsRequest = async (): Promise<RoundsListResponse> => {
	const { data } = await api.get("/admin/round");
	const validation = roundsListResponseSchema.safeParse(data);
	if (!validation.success) {
		throw validation.error;
	}
	return validation.data;
};

export const getRoundByIdRequest = async (roundId: string): Promise<RoundItemResponse> => {
	const { data } = await api.get(`/admin/round/${roundId}`);
	const validation = roundItemResponseSchema.safeParse(data);
	if (!validation.success) {
		throw validation.error;
	}
	return validation.data;
};

export const createRoundRequest = async (
	payload: CreateRoundInput
): Promise<RoundItemResponse> => {
	const inputValidation = createRoundSchema.safeParse(payload);
	if (!inputValidation.success) {
		throw inputValidation.error;
	}
	const { data } = await api.post("/admin/round", inputValidation.data);
	const responseValidation = roundItemResponseSchema.safeParse(data);
	if (!responseValidation.success) {
		throw responseValidation.error;
	}
	return responseValidation.data;
};

export const updateRoundRequest = async (
	roundId: string,
	payload: UpdateRoundInput
): Promise<RoundItemResponse> => {
	const inputValidation = updateRoundSchema.safeParse(payload);
	if (!inputValidation.success) {
		throw inputValidation.error;
	}
	const { data } = await api.patch(`/admin/round/${roundId}`, inputValidation.data);
	const responseValidation = roundItemResponseSchema.safeParse(data);
	if (!responseValidation.success) {
		throw responseValidation.error;
	}
	return responseValidation.data;
};

export const deleteRoundRequest = async (
	roundId: string
): Promise<RoundActionResponse> => {
	const { data } = await api.delete(`/admin/round/${roundId}`);
	const validation = roundActionResponseSchema.safeParse(data);
	if (!validation.success) {
		throw validation.error;
	}
	return validation.data;
};
export const startRoundRequest = async (
	roundId: string
): Promise<RoundItemResponse> => {
	const { data } = await api.post(`/admin/round/${roundId}/start`);
	const validation = roundItemResponseSchema.safeParse(data);
	if (!validation.success) {
		throw validation.error;
	}
	return validation.data;
};

export const pauseResumeRoundRequest = async (
	roundId: string
): Promise<RoundItemResponse> => {
	const { data } = await api.post(`/admin/round/${roundId}/pause-resume`);
	const validation = roundItemResponseSchema.safeParse(data);
	if (!validation.success) {
		throw validation.error;
	}
	return validation.data;
};

export const extendRoundRequest = async (
	roundId: string,
	payload: ExtendRoundInput
): Promise<RoundItemResponse> => {
	const inputValidation = extendRoundSchema.safeParse(payload);
	if (!inputValidation.success) {
		throw inputValidation.error;
	}
	const { data } = await api.post(`/admin/round/${roundId}/extend`, inputValidation.data);
	const responseValidation = roundItemResponseSchema.safeParse(data);
	if (!responseValidation.success) {
		throw responseValidation.error;
	}
	return responseValidation.data;
};

export const endRoundRequest = async (
	roundId: string
): Promise<RoundActionResponse> => {
	const { data } = await api.post(`/admin/round/${roundId}/end`);
	const validation = roundActionResponseSchema.safeParse(data);
	if (!validation.success) {
		throw validation.error;
	}
	return validation.data;
};

export const resetRoundRequest = async (
	roundId: string
): Promise<RoundActionResponse> => {
	const { data } = await api.post(`/admin/round/${roundId}/reset`);
	const validation = roundActionResponseSchema.safeParse(data);
	if (!validation.success) {
		throw validation.error;
	}
	return validation.data;
};
