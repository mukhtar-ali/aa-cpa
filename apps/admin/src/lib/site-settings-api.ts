import { endpoint, type EmailSettingsModel, type GlobalSeoSettingsModel, type WebsiteInfoSectionModel } from '@repo/shared'
import { api } from './api'

export async function getWebsiteInfo() {
    const res = await api.get<WebsiteInfoSectionModel>(endpoint.common.websiteInfo)
    return res.data
}

export async function updateWebsiteInfo(data: WebsiteInfoSectionModel) {
    const res = await api.put<WebsiteInfoSectionModel>(endpoint.common.websiteInfo, data)
    return res.data
}

export async function getGlobalSeo() {
    const res = await api.get<GlobalSeoSettingsModel>(endpoint.common.seoGlobal)
    return res.data
}

export async function updateGlobalSeo(data: GlobalSeoSettingsModel) {
    const res = await api.put<GlobalSeoSettingsModel>(endpoint.common.seoGlobal, data)
    return res.data
}

export async function getEmailSettings() {
    const res = await api.get<EmailSettingsModel>(endpoint.common.emailSettings)
    return res.data
}

export async function updateEmailSettings(data: EmailSettingsModel) {
    const res = await api.put<{ message: string }>(endpoint.common.emailSettings, data)
    return res.data
}

export async function sendTestEmail(to: string) {
    const res = await api.post<{ message: string }>(endpoint.common.emailSettingsTest, { to })
    return res.data
}
