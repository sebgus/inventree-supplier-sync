/**
 * Component Lifecycle Overview Panel
 * Shows all Mouser parts with non-active lifecycle statuses.
 * Loaded by InvenTree 1.x plugin panel system as a dynamic ES module.
 */

const React = window.React;
const { useState, useEffect } = React;

// Lifecycle statuses to exclude from the overview (considered "healthy")
const HEALTHY_STATUSES = ['active', 'new product', ''];

// Color coding by lifecycle status keyword
function getStatusStyle(status) {
    if (!status) return {};
    const s = status.toLowerCase();
    if (s.includes('last time buy') || s.includes('ltb')) {
        return { backgroundColor: '#fff3cd', color: '#856404' }; // warning yellow
    }
    if (s.includes('not recommended') || s.includes('nrnd')) {
        return { backgroundColor: '#fff3cd', color: '#856404' }; // warning yellow
    }
    if (s.includes('end of life') || s.includes('eol')) {
        return { backgroundColor: '#f8d7da', color: '#842029' }; // danger red
    }
    if (s.includes('discontinued') || s.includes('obsolete')) {
        return { backgroundColor: '#f8d7da', color: '#842029' }; // danger red
    }
    return { backgroundColor: '#e2e3e5', color: '#383d41' }; // secondary gray
}

function LifecyclePanel({ context }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortKey, setSortKey] = useState('lifecycle');

    const baseUrl = context?.base_url || '/plugin/suppliersync/';

    useEffect(() => {
        fetch(`${baseUrl}lifecycle/`)
            .then(r => r.json())
            .then(data => {
                setItems(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [baseUrl]);

    if (loading) return React.createElement('p', null, 'Loading...');
    if (items.length === 0) return React.createElement('p', { style: { color: 'green' } }, 'No lifecycle warnings — all components are active.');

    const sorted = [...items].sort((a, b) => {
        const av = (a[sortKey] || '').toLowerCase();
        const bv = (b[sortKey] || '').toLowerCase();
        return av < bv ? -1 : av > bv ? 1 : 0;
    });

    function th(label, key) {
        return React.createElement(
            'th',
            {
                style: { cursor: 'pointer', userSelect: 'none' },
                onClick: () => setSortKey(key),
            },
            label,
            sortKey === key ? ' ▲' : ''
        );
    }

    return React.createElement(
        'div', null,
        React.createElement(
            'p', { style: { marginBottom: '8px', fontSize: '0.85em', color: '#666' } },
            `${items.length} component(s) with lifecycle warnings. Click column headers to sort.`
        ),
        React.createElement(
            'table',
            { className: 'table table-condensed table-striped', style: { fontSize: '0.9em' } },
            React.createElement(
                'thead', null,
                React.createElement(
                    'tr', null,
                    th('IPN', 'ipn'),
                    th('Name', 'name'),
                    th('SKU', 'sku'),
                    th('Lifecycle Status', 'lifecycle'),
                    React.createElement('th', null, 'Mouser Link'),
                )
            ),
            React.createElement(
                'tbody', null,
                ...sorted.map(item =>
                    React.createElement(
                        'tr', { key: item.part_pk },
                        React.createElement('td', null,
                            React.createElement('a', { href: `/part/${item.part_pk}/` }, item.ipn || item.part_pk)
                        ),
                        React.createElement('td', null, item.name),
                        React.createElement('td', null, item.sku),
                        React.createElement('td', null,
                            React.createElement(
                                'span',
                                {
                                    style: {
                                        ...getStatusStyle(item.lifecycle),
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontWeight: 'bold',
                                        whiteSpace: 'nowrap',
                                    }
                                },
                                item.lifecycle
                            )
                        ),
                        React.createElement('td', null,
                            item.link
                                ? React.createElement('a', { href: item.link, target: '_blank', rel: 'noreferrer' }, 'Mouser ↗')
                                : '—'
                        ),
                    )
                )
            )
        )
    );
}

export default LifecyclePanel;
