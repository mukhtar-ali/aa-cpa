import {
  endpoint,
  type CareersPageSettingsModel,
  type JobApplicationModel,
  type JobApplicationQueryModel,
  type JobApplicationStatusModel,
  type JobFormModel,
  type JobModel,
  type JobQueryModel,
  type PaginatorModel,
} from '@repo/shared'
import { api } from './api'
import { toQueryParams } from './table-filters'

export type JobsResponse = PaginatorModel<JobModel>

export type JobApplicationsResponse = PaginatorModel<JobApplicationModel>

export async function getJobs(query: JobQueryModel) {
  const res = await api.get<JobsResponse>(endpoint.job.list, { params: toQueryParams(query) })
  return res.data
}

export async function getJobById(id: string) {
  const res = await api.get<{ job: JobModel }>(`${endpoint.job.getById}/${id}`)
  return res.data
}

export async function createJob(data: JobFormModel) {
  const res = await api.post<{ job: JobModel }>(endpoint.job.create, data)
  return res.data
}

export async function updateJob(id: string, data: JobFormModel) {
  const res = await api.put<{ job: JobModel }>(`${endpoint.job.update}/${id}`, data)
  return res.data
}

export async function deleteJob(id: string) {
  const res = await api.delete(`${endpoint.job.delete}/${id}`)
  return res.data
}

export async function getJobApplications(query: JobApplicationQueryModel) {
  const res = await api.get<JobApplicationsResponse>(endpoint.jobApplication.list, { params: query })
  return res.data
}

export async function updateJobApplicationStatus(id: string, data: JobApplicationStatusModel) {
  const res = await api.put(`${endpoint.jobApplication.updateStatus}/${id}/status`, data)
  return res.data
}

export async function deleteJobApplication(id: string) {
  const res = await api.delete(`${endpoint.jobApplication.delete}/${id}`)
  return res.data
}

export async function getCareersPageSettings() {
  const res = await api.get<CareersPageSettingsModel>(endpoint.careersPage.settings)
  return res.data
}

export async function updateCareersPageSettings(data: CareersPageSettingsModel) {
  const res = await api.put(endpoint.careersPage.settings, data)
  return res.data
}
