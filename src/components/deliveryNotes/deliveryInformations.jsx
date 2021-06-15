import React from 'react';
import DeliveryTable from 'src/components/deliveryNotes/deliveryTable';
import { Page, Text, View, Document, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import { isDefinedAndNotVoid } from 'src/helpers/utils';

const styles = StyleSheet.create({
    viewer: {
        height: '100vh',
        width: '100vw'
    },
    document: {
        height: '100vh',
        width: '100vw'
    },
    page: {
      backgroundColor: '#E4E4E4',
      width: 100,
      height: 100
    },
    header: {
        flexDirection: 'row',
        marginTop: 15,
        marginBottom: 15
    },
    society: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
        width: 100,
        height: 100,
        textAlign: 'left'
    },
    client: {
        margin: 10,
        padding: 10,
        flexGrow: 1,
        width: 100,
        height: 100,
        textAlign: 'right'
    },
    pageNumber: {
        textAlign: 'right',
        fontSize: 8,
        marginRight: 30
    },
    pageText: {
        marginLeft: 12,
        marginBottom: 6,
        fontSize: 9,
    },
    orderNumber: {
        marginLeft: 10,
        marginTop: 30,
        paddingLeft: 10,
        textAlign: 'left'
    },
    date: {
        marginLeft: 10,
        marginTop: 10,
        paddingLeft: 10,
        textAlign: 'left'
    },
    text: {
        marginLeft: 12,
        marginBottom: 6,
        fontSize: 11,
    },
    h3: {
        marginLeft: 12,
        marginBottom: 6,
        fontSize: 13,
        fontWeight: 'extrabold'
    },
    small: {
        marginLeft: 12,
        marginRight: 12,
        marginBottom: 6,
        fontSize: 8,
    },
    title: {
        fontSize: 18,
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        fontSize: 10,
        bottom: 10,
        left: 0,
        right: 0,
        textAlign: 'left',
        // color: 'grey'
    }
});

const DeliveryInformations = ({order, ordersLength, maxPerPage }) => {

    const totalPages = Math.ceil(ordersLength / maxPerPage);
    const pages = [...Array(totalPages).keys()];

    return (
        pages.map((page, i) => {

            const itemsToDisplay = order.items.slice((i * totalPages), ((i + 1) * totalPages));
            const orderPages = Math.ceil(order.items.length / maxPerPage);

            return !isDefinedAndNotVoid(itemsToDisplay) ? <></> : (
                <Page size="A4" style={ styles.page }>
                    <View style={styles.header}>
                        <View style={ styles.society }>
                            <Text style={styles.h3}>SAS FRAIS PEI</Text>
                            <Text style={styles.text}>19 chemin Raphaël</Text>
                            <Text style={styles.text}>97410 SAINT PIERRE</Text>
                            <Text style={styles.small}>N° SIRET : 832719181 00014</Text>
                        </View>
                        <View style={ styles.client }>
                            <Text style={styles.h3}>{ order.name }</Text>
                            <Text style={styles.text}>{ order.metas.address }</Text>
                            <Text style={styles.text}>{ order.metas.address2 }</Text>
                            <Text style={styles.text}>{ "Tel : " + order.metas.phone }</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={styles.title}>BON DE LIVRAISON</Text>
                    </View>
                    <View style={ styles.orderNumber }>
                        <Text style={styles.h3}>{"Commande N°" + order.id.toString().padStart(10, '0') }</Text>
                    </View>
                    <View style={ styles.date }>
                        <Text style={styles.text}>{"Le " + new Date(order.deliveryDate).toLocaleDateString() + ',' }</Text>
                    </View>
                    <View style={ styles.pageNumber }>
                        <Text style={styles.pageText}>Page { i + 1 } sur { orderPages }</Text>
                    </View>

                    <DeliveryTable order={ order } items={ itemsToDisplay }/>
        
                    <View style={ styles.footer }>
                        <Text style={styles.small}>
                            En cas de retard de paiement, une pénalité égale à 3 fois le taux d'intérêt légal sera exigible (Décret 2009-138 du 9 février 2009), ainsi qu'une indémnité forfaitaire pour frais de
                            recouvrement d'un montant minimum de 40 euros pour les professionnels (Décret 2012-1115 du 9 octobre 2012).
                        </Text>
                    </View>
                </Page>
            )
        })
    );
}
 
export default DeliveryInformations;