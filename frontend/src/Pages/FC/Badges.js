import React, { useEffect } from 'react';
import { Route } from 'react-router-dom';
import { AuthContext } from '../../contexts';
import { Button, Input, Select } from '../../Components/Form';
import CharacterName from '../../Components/CharacterName';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';
import Table from '../../Components/DataTable';
import { apiCall, useApi } from '../../api';
import { formatDatetime } from '../../Util/time';
import { Shield, tagBadges } from '../../Components/Badge';
import { AddBadge, RevokeButton } from './badges/BadgesPageControls';

const BadgesPage = () => {
    const authContext = React.useContext(AuthContext);

    return authContext && authContext.access["badges-manage"] ? ( 
        <Route exact path="/fc/badges">
            <View />
        </Route>
    ) 
    : <></>;
}

export default BadgesPage;

const Header = styled.div`
    padding-bottom: 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-content: space-between;
`;

const A = styled.a`
, &:visited {
    color: ${props =>props.theme.colors?.text};
}

&:hover { 
    color: ${props =>props.theme.colors?.active};
    transition: ease-in-out 0.15s
}
`;

const special_sort = (charA, charB) => {
    const a = charA.name.toLowerCase();
    const b = charB.name.toLowerCase();
    if      (a > b) return 1;
    else if (b > a) return -1;
    else return 0;
};

const FilterComponents = ({ badgeOptions, filters, onChange, onClear }) => {
    const handleSelect = evt => {
        let f = filters;
        f.type = evt.target.value === '-1' ? null : evt.target.value;
        onChange(f);
    }

    const handleNameChange = evt => {
        let f = filters;
        f.name = evt.target.value;
        onChange(f);
    }

    return (
        <>
            <span style={{ fontStyle: 'italic', marginRight: '10px'}}>Filter results by...</span>
            <Select value={filters?.type ?? ''} 
            onChange={handleSelect}
            style={{ 
                marginRight: '10px',
                marginBottom: '10px',
                appearance: 'auto',
            }}>
                <option value={-1}>any type...</option>
                { badgeOptions?.map((badge, key) => <option value={badge.id} key={key} readOnly>{badge.name}</option>)}
            </Select>
            <Input value={filters?.name ?? ''} onChange={handleNameChange} placeholder='pilot name' style={{ marginRight: '10px', marginBottom: '10px'}} />
            <Button variant={"primary"} onClick={onClear} style={{ marginBottom: '10px'}}>Clear</Button>       
        </>
    )
}

const View = ()  => {
    const [ badges, updateData ] = useApi('/api/badges');
    const [ characters, setChracters ] = React.useState(null);
    const [ modalOpen, setModalOpen ] = React.useState(false);
    const [ filters, setFilters ] = React.useState({ type: null, name: '' });
    
    useEffect(() => {
        if (!badges) {
            return; // We can't do API calls if this value is null
        }

        var promises = [];
        badges.forEach((badge) => {
            promises.push(new Promise((resolve, reject) => {
                apiCall(`/api/badges/${badge.id}/members`, {})
                .then((res) => {
                    resolve(res);
                })
                .catch((e) => reject(e));
            }));
        });
        
        Promise.all(promises).then((e) => {
            let characters = [];
            for(let i = 0; i < e.length; i++) {
                if (e[i].length !== 0) {
                    characters = [...characters, ...e[i]];
                }
            }
            setChracters(characters);
        });
    }, [badges])

    const columns = [
        { name: 'Pilot Name', sortable: true, sortFunction: (rowA, rowB) => special_sort(rowA.character, rowB.character), grow: 2, selector: row => <CharacterName {...row.character } /> },
        { name: 'Badge', sortable: true, sortFunction: (rowA, rowB) => special_sort(rowA.badge, rowB.badge), grow: 1,  selector: row => {
            const badge = tagBadges[row.badge.name];
            return <Shield style={{verticalAlign:'middle'}}  h={'1.8em'} color={badge[0]} letter={badge[1]} title={badge[2]} />
        }},
        { name: 'Granted By', sortable: true, sortFunction: (rowA, rowB) => special_sort(rowA.granted_by, rowB.granted_by), hide: 'md', grow: 2, selector: row => <CharacterName {...row.granted_by } /> },
        { name: 'Granted At', hide: 'sm', grow: 2, selector: row => formatDatetime(new Date(row.granted_at * 1000)) },
        { name: '', grow: 1, minWidth: '95', selector: row => <RevokeButton badgeId={row.badge.id} characterId={row.character.id} refreshFunction={updateData} /> }
    ];

    const TableHeader = React.useMemo(() => {
        const handleClear = () => setFilters({ type: null, name: '' });

        return <FilterComponents
            badgeOptions={badges}
            filters={filters}
            onChange={e => setFilters({
                ...e
            })}
            onClear={handleClear}
        />
    }, [ filters, badges ])

    // filter results by badge type and pilot assigned name
    const filteredData = (characters ?? []).filter(row => row && row.character    
        && (!filters.type || row.badge.id == filters.type) // eslint-disable-line                      
        && row.character.name.toLowerCase().includes(filters?.name.toLowerCase())
    );
    
    return (
        <>
            <Header>
                <h1 style={{fontSize: '32px'}}>Specialist Badges</h1>
                <Button variant={"primary"} onClick={() => setModalOpen(true)}>
                    <FontAwesomeIcon fixedWidth icon={faPlus} style={{ marginRight: '10px'}} />
                    Assign Badge
                </Button>
            </Header>
            
            <p style={{ marginBottom: '10px' }}>You can find the badge guide <A href="/badges">here</A>.</p>

            <Table columns={columns} data={filteredData}
                defaultSortFieldId={1}
                subHeader
                subHeaderComponent={TableHeader}
                pagination
                persistTableHead
                progressPending={!characters}
                paginationPerPage={25}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
            />

            <AddBadge badgeOptions={badges}
                isOpen={modalOpen}
                setOpen={setModalOpen}
                refreshFunction={updateData} 
            />
        </>
    )
}