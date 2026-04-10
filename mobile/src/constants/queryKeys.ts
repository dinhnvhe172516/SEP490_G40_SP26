export const QUERY_KEYS = {
    AUTH: {
        PROFILE: ['auth', 'profile'],
        SESSION: ['auth', 'session'],
    },
    APPOINTMENTS: {
        LIST: ['appointments', 'list'],
        DETAIL: (id: string) => ['appointments', 'detail', id],
        PATIENT: ['appointments', 'patient'],
    },
    DENTAL_RECORDS: {
        LIST: ['dental-records', 'list'],
        DETAIL: (id: string) => ['dental-records', 'detail', id],
    },
} as const;
