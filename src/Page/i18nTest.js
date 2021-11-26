import React, { useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import Footer from '../Component/footer'

import { installFuncHotkey } from 'use-github-hotkey'


// with useHotkey fix test ...

const lngs = {
    en: { nativeName: 'English' },
    de: { nativeName: 'Deutsch' },
    ko: { nativeName: 'Korean' }
}

export default function Main() {
    const { t, i18n } = useTranslation();


    function Test() {
        alert("works")
    }

    useEffect(() => {
        installFuncHotkey(Test, "h")

    }, [])

    return (
        <div>
            <div>
                {Object.keys(lngs).map((lng) => (
                    <button key={lng} style={{ fontWeight: i18n.resolvedLanguage === lng ? 'bold' : 'normal' }} type="submit" onClick={() => i18n.changeLanguage(lng)}>
                        {lngs[lng].nativeName}
                    </button>
                ))}
            </div>
            <p>
                <Trans i18nKey="description.part1">
                    Edit <code>src/App.js</code> and save to reload.
                </Trans>
            </p>
            <a
                href="https://reactjs.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                {t('description.part2')}
            </a>
            <Footer t={t} />

            <textarea id="text-area-1"  rows="4" cols="40"> text area 1</textarea>
        </div>
    )
}