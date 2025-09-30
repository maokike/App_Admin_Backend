import React, { useState } from 'react';
import { View, Text, Button, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { db } from '../firebase-init';
import { collection, getDocs, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { globalStyles, colors } from '../styles/globalStyles';

const AdminMigrationScreen = () => {
    const [migrating, setMigrating] = useState(false);
    const [log, setLog] = useState([]);

    const addLog = (message) => {
        console.log(message);
        setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const migrateSales = async () => {
        setMigrating(true);
        setLog([]);
        
        try {
            addLog('🔄 Iniciando migración de ventas...');
            
            // Obtener todas las ventas ordenadas por fecha
            const q = query(collection(db, 'sales'), orderBy('date', 'asc'));
            const snapshot = await getDocs(q);
            
            addLog(`📊 Encontradas ${snapshot.size} ventas para migrar`);
            
            const salesByGroup = {};
            
            // Agrupar ventas por localId y fecha (mismo minuto)
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.date && data.date.toDate) {
                    const date = data.date.toDate();
                    // Crear clave de agrupación: localId + fecha completa
                    const groupKey = `${data.localId}_${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${date.getHours()}:${date.getMinutes()}`;
                    
                    if (!salesByGroup[groupKey]) {
                        salesByGroup[groupKey] = [];
                    }
                    salesByGroup[groupKey].push({ 
                        id: doc.id, 
                        data: data,
                        date: date
                    });
                }
            });
            
            addLog(`🔍 Formados ${Object.keys(salesByGroup).length} grupos potenciales`);
            
            let processed = 0;
            let groupsCreated = 0;
            
            // Procesar cada grupo que tenga más de 1 producto
            for (const [groupKey, sales] of Object.entries(salesByGroup)) {
                if (sales.length > 1) {
                    const ventaId = `VENTA_${sales[0].date.getTime()}_${groupsCreated}`;
                    groupsCreated++;
                    
                    addLog(`\n📦 Creando venta agrupada ${ventaId}:`);
                    addLog(`   Local: ${sales[0].data.localId}`);
                    addLog(`   Fecha: ${sales[0].date.toLocaleString()}`);
                    addLog(`   Productos: ${sales.length}`);
                    
                    for (const sale of sales) {
                        addLog(`   - ${sale.data.quantity}x ${sale.data.producto} - $${sale.data.total}`);
                        
                        // Actualizar el documento con el ventaId
                        await updateDoc(doc(db, 'sales', sale.id), {
                            ventaId: ventaId
                        });
                        processed++;
                    }
                }
            }
            
            addLog(`\n🎉 MIGRACIÓN COMPLETADA`);
            addLog(`📦 ${groupsCreated} ventas agrupadas creadas`);
            addLog(`🏷️ ${processed} documentos actualizados`);
            
            Alert.alert(
                '✅ Migración completada', 
                `Se crearon ${groupsCreated} ventas agrupadas\n${processed} documentos actualizados`,
                [{ text: 'OK' }]
            );
                
        } catch (error) {
            console.error('❌ Error:', error);
            addLog(`❌ Error: ${error.message}`);
            Alert.alert('❌ Error', 'Hubo un problema en la migración: ' + error.message);
        } finally {
            setMigrating(false);
        }
    };

    return (
        <View style={globalStyles.container}>
            <View style={{ padding: 20 }}>
                <Text style={globalStyles.title}>Migración de Ventas</Text>
                
                <Text style={{ 
                    marginBottom: 20, 
                    textAlign: 'center', 
                    color: colors.textLight,
                    lineHeight: 20 
                }}>
                    Esta operación agrupará productos vendidos en el mismo minuto bajo un mismo ventaId.
                </Text>
                
                {migrating && (
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                        <ActivityIndicator size="large" color={colors.primaryPink} />
                        <Text style={{ marginTop: 10, color: colors.textLight }}>Procesando migración...</Text>
                    </View>
                )}
                
                <Button 
                    title={migrating ? "Migrando..." : "Iniciar Migración"} 
                    onPress={migrateSales}
                    disabled={migrating}
                    color={colors.primaryPink}
                />
            </View>
            
            <ScrollView style={{ 
                flex: 1, 
                padding: 10, 
                backgroundColor: '#f5f5f5',
                marginHorizontal: 10,
                marginBottom: 10,
                borderRadius: 8
            }}>
                {log.length === 0 ? (
                    <Text style={{ textAlign: 'center', color: colors.textLight, marginTop: 20 }}>
                        Los logs aparecerán aquí cuando inicies la migración...
                    </Text>
                ) : (
                    log.map((entry, index) => (
                        <Text key={index} style={{ 
                            fontSize: 12, 
                            marginBottom: 4,
                            fontFamily: 'monospace',
                            color: entry.includes('❌') ? 'red' : 
                                   entry.includes('✅') ? 'green' : 
                                   entry.includes('🎉') ? 'green' :
                                   entry.includes('🔄') ? 'blue' : 
                                   entry.includes('📊') ? 'orange' :
                                   entry.includes('🔍') ? 'purple' : 'black'
                        }}>
                            {entry}
                        </Text>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

export default AdminMigrationScreen;