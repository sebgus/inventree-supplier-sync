/**
 * Supplier Sync Panel
 * Loaded by InvenTree 1.x plugin panel system as a dynamic ES module.
 * React is expected to be available on window.React (provided by InvenTree).
 */

const React = window.React;
const { useState, useEffect } = React;

function SupplierSyncPanel({ context }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const partPk = context?.part_pk;
    const baseUrl = context?.base_url || '/plugin/suppliersync/';

    function fetchData() {
        if (!partPk) {
            setLoading(false);
            return;
        }
        fetch(`${baseUrl}syncdata/${partPk}/`)
            .then(r => r.json())
            .then(data => {
                setItems(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }

    useEffect(() => { fetchData(); }, [partPk]);

    function handleDelete(pk) {
        fetch(`${baseUrl}deleteentry/${pk}/`).then(() => fetchData());
    }

    function handleAdd(pk) {
        fetch(`${baseUrl}addpart/${pk}/`)
            .then(r => r.text())
            .then(text => { if (text === 'OK') fetchData(); });
    }

    function handleIgnore(pk) {
        fetch(`${baseUrl}ignorepart/${pk}/`).then(() => fetchData());
    }

    if (loading) {
        return React.createElement('p', null, 'Loading...');
    }

    if (items.length === 0) {
        return React.createElement('p', null, 'No sync results for this part.');
    }

    return React.createElement(
        'table',
        { className: 'table table-condensed table-striped' },
        React.createElement(
            'thead', null,
            React.createElement(
                'tr', null,
                React.createElement('th', null, '#'),
                React.createElement('th', null, 'Change'),
                React.createElement('th', null, 'Old value'),
                React.createElement('th', null, 'New value'),
                React.createElement('th', null, 'Comment'),
                React.createElement('th', null, 'Date'),
                React.createElement('th', null, 'Actions'),
            )
        ),
        React.createElement(
            'tbody', null,
            ...items.map(item =>
                React.createElement(
                    'tr', { key: item.pk },
                    React.createElement('td', null, item.pk),
                    React.createElement('td', null, item.change_type),
                    React.createElement('td', null, item.old_value),
                    React.createElement('td', null,
                        item.change_type === 'add' && item.link
                            ? React.createElement('a', { href: item.link, target: '_blank' }, item.new_value)
                            : item.new_value
                    ),
                    React.createElement('td', null, item.comment),
                    React.createElement('td', null, item.updated_at),
                    React.createElement(
                        'td', null,
                        React.createElement('button', {
                            type: 'button',
                            className: 'btn btn-sm btn-outline-danger',
                            title: 'Delete',
                            onClick: () => handleDelete(item.pk),
                        }, React.createElement('i', { className: 'fas fa-trash-alt' })),
                        ' ',
                        React.createElement('button', {
                            type: 'button',
                            className: 'btn btn-sm btn-outline-secondary',
                            title: 'Ignore part',
                            onClick: () => handleIgnore(item.pk),
                        }, React.createElement('i', { className: 'fas fa-ban' })),
                        ' ',
                        item.number_of_parts === 1
                            ? React.createElement('button', {
                                type: 'button',
                                className: 'btn btn-sm btn-outline-success',
                                title: 'Add supplier part',
                                onClick: () => handleAdd(item.pk),
                            }, React.createElement('i', { className: 'fas fa-shopping-cart' }))
                            : null,
                    )
                )
            )
        )
    );
}

export default SupplierSyncPanel;
