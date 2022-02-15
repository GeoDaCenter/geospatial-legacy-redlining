import styles from '../styles/Legend.module.css'

export default function Legend({
    bins,
    colors,
    labels,
    separateZero,
    categorical,
    title
}) {

    return <div className={styles.legendContainer}>
        {!!title && <p className={styles.legendTitle}>{title}</p>}
        {!!separateZero && <div className={styles.legendEntry}>
            <span style={{ backgroundColor: 'rgb(240,240,240)' }} className={styles.legendSwatch}>&nbsp;</span>
            <p>Zero</p>
        </div>}
        {!!categorical && bins.map((bin, i) => <div className={styles.legendEntry}>
            <span style={{ backgroundColor: `rgb(${colors[i].join(',')})` }} className={styles.legendSwatch}>&nbsp;</span>
            <p>{labels ? labels[i] : bin}</p>
        </div>)}
        {!categorical && bins.map((bin, i) => <div className={styles.legendEntry}>
            <span style={{ backgroundColor: `rgb(${colors[i].join(',')})` }} className={styles.legendSwatch}>&nbsp;</span>
            <p>{labels ? labels[i] : i === 0 ? `< ${bin}` : `${bins[i - 1]} - ${bin}`}</p>
        </div>)}
    </div>
}