import api from './axios'

export const loginApi = async (username, password) => {
  const response = await api.post(
    '/auth/sign-in',
    { username, password },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  )
  return response.data
}

export const uploadFileApi = async (file) => {
  const formData = new FormData()
  formData.append('file', file, file.name)
  const response = await api.post('/leases/extract', formData)
  return response.data
}

export const getDraftLeaseApi = async (leaseId) => {
  const response = await api.get(`/leases/${leaseId}/draft`)
  return response.data
}

export const approveLeaseApi = async (leaseId, approvalPayload) => {
  const response = await api.post(`/leases/${leaseId}/approve`, approvalPayload, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.data
}

export const generateGlWorkbookApi = async (leaseId) => {
  const response = await api.post(`/gl/${leaseId}/gl`, undefined, {
    responseType: 'blob',
  })
  const disposition = response.headers['content-disposition']
  const fileName = getFileNameFromDisposition(disposition) || 'master_gl_workbook.xlsx'

  return {
    blob: response.data,
    fileName,
  }
}

const getFileNameFromDisposition = (disposition) => {
  if (!disposition) return ''

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1].replace(/"/g, ''))

  const fileNameMatch = disposition.match(/filename="?([^"]+)"?/i)
  return fileNameMatch?.[1] || ''
}
