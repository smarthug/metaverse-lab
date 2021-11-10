import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { DateTime } from 'luxon';

// 이게 동적으로 모듈을 추가함에 따라 추가되어야 하나 ??? 
i18n.use(LanguageDetector).use(initReactI18next).init({
    debug: true,
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false,
        format: (value, format, lng) => {
            if ( value instanceof Date) {
                return DateTime.fromJSDate(value).setLocale(lng).toLocaleString(DateTime[format])
            }
        }
    },
    resources: {
        en: {
            translation: {
                description: {
                    part1: 'Edit <1>src/App.js</1> and save to reload.',
                    part2: 'Learn React'
                },
                footer: {
                    date: 'Today is {{date, DATE_HUGE}}'
                }
            }
        },
        de: {
            translation: {
                description: {
                    part1: 'Ändere <1>src/App.js</1> und speichere um neu zu laden.',
                    part2: 'Lerne React'
                },
                footer: {
                    date: 'Heute ist {{date, DATE_HUGE}}'
                }
            }
        },
        ko: {
            translation: {
                description:{
                    part1: "<1>src/App.js</1> 을 수정, 그리고 저장해서 리로드하기.",
                    part2: "React 배우기"
                },
                footer: {
                    date: '오늘은 {{date, DATE_HUGE}}'
                }

            }
        }
    }
})

export default i18n