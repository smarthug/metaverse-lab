export default function Footer({ t }) {

    return (
        <div className="Footer">
            <div>{t('footer.date', { date: new Date() })}</div>
        </div>
    )
}