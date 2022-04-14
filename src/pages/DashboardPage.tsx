import { Box, useTheme } from '@material-ui/core';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import { makeStyles } from '@material-ui/styles';
import { useState } from 'react';
import { ReactElement } from 'react';
import { useEffect } from 'react'
import Loader from 'react-loader-spinner';
import { fetchShipments } from '../data/fetch-shipments';
import { Shipment } from '../data/Shipment';

type ShipmentResultStatus = 'ERROR' | 'LOADING' | 'SUCCESS';


type ShipmentsForDates = {
    date: string;
    shipments: Shipment[];
}

const useStyles = makeStyles({
    grid: {
        marginInline: 16,
        height: '100%',
    },
    loader: {
        margin: 'auto',
        width: 'fit-content',
        marginTop: 200
    },
    daysContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
        alignContent: 'center',
        paddingTop: '2em',
        paddingBottom: '5em'
    },
    gridContainer: {
        width: '34em',
        height: '30em',
        paddingBottom: '5em'
    },
    date: {
        marginLeft: '1em'
    },
    overlay: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        padding: '5rem'
    }
});

const COLUMNS: GridColDef[] = [
    {
        field: 'houseBillNumber',
        headerName: 'House Bill',
        width: 150
    },
    {
        field: 'client',
        headerName: 'Shipper',
        width: 200
    },
    {
        field: 'mode',
        headerName: 'Mode',
        width: 150
    },
]

export const DashboardPage: React.FC = () => {

    const classes = useStyles();
    const theme = useTheme()
    const today = new Date();

    const fillDates = (): ShipmentsForDates[] => {
        return Array.from(Array(7)).map((_, i) => {
            const weekDay = new Date();
            weekDay.setDate(today.getDate() + i);
            return {
                date: weekDay.toDateString(),
                shipments: []
            };
        });
    }

    const [arrivingShipments, setArrivingShipments] = useState<ShipmentsForDates[]>([]);
    const [shipmentResultStatus, setShipmentResultStatus] = useState<ShipmentResultStatus>('LOADING');
    useEffect(() => {
        fetchShipments().then(result => {
            if (result.status === 'SUCCESS') {
                setArrivingShipments(filterShipments(result.shipments));
            }
            setShipmentResultStatus(result.status);

        });
    }, []);

    

    const filterShipments = (shipments: Shipment[]): ShipmentsForDates[] => {

        const arrivingShipments = fillDates();
        shipments.forEach(shipment => {
            arrivingShipments.forEach(shipmentForDate => {

                if (new Date(shipment.estimatedArrival).toDateString() === shipmentForDate.date) {
                    shipmentForDate.shipments.push(shipment);
                }
            });
        });

        return arrivingShipments;
    }

    const NoShipmentOveraly = () => (<div className={classes.overlay}>No shipments for date</div>)

    let component: ReactElement;

    switch (shipmentResultStatus) {
        case 'SUCCESS': 
            component = 
                <div className={classes.daysContainer}>
                    {arrivingShipments.map(arrivingShipment => 
                    <div className={classes.gridContainer}>
                            <h2 className={classes.date}>{arrivingShipment.date}</h2>
                            <DataGrid 
                                components={{
                                    NoRowsOverlay: NoShipmentOveraly
                                }}
                                className={classes.grid}
                                rows={arrivingShipment.shipments}
                                columns={COLUMNS}
                                autoPageSize
                                disableSelectionOnClick
                            />
                    </div>
                    )}
                </div>
            break;
        case 'LOADING':
            component = 
                <Box className={classes.loader}>
                    <Loader type="Grid" color={theme.palette.primary.main} />
                </Box>
            break;
        case 'ERROR':
            component = <p>Error</p>
            break;
    }


    return component;
}