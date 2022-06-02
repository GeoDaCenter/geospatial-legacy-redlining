import styles from '../styles/Legend.module.css'

export const LegendEntry = ({
    bins,
    colors,
    labels,
    separateZero,
    categorical,
    title
}) => {
    
    return <div className={styles.legendContainer}>
        {!!title && <p className={styles.legendTitle}>{title}</p>}
        {!!separateZero && <div className={styles.legendEntry}>
            <span style={{ backgroundColor: 'rgb(50,50,50)' }} className={styles.legendSwatch}>&nbsp;</span>
            <p>0</p>
        </div>}
        {!!categorical && bins.map((bin, i) => <div className={styles.legendEntry} key={`Legend-entry-${i}`}>
            <span style={{ backgroundColor: colors[i].length === 3 ? `rgb(${colors[i].join(',')})` : `rgba(${colors[i].slice(0, 3).join(',')},${(colors[i][3] / 255).toFixed(2)})` }} className={styles.legendSwatch}>&nbsp;</span>
            <p>{labels ? labels[i] : bin}</p>
        </div>)}
        {!categorical && bins.map((bin, i) => <div className={styles.legendEntry} key={`Legend-entry-${i}`}>
            <span style={{ backgroundColor: colors[i].length === 3 ? `rgb(${colors[i].join(',')})` : `rgba(${colors[i].slice(0, 3).join(',')},${(colors[i][3] / 255).toFixed(2)})` }} className={styles.legendSwatch}>&nbsp;</span>
            <p>{labels ? labels[i] : i === 0 ? `< ${bin}` : `${bins[i - 1]} - ${bin}`}</p>
        </div>)}
    </div>
}