import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    FlatList, 
    TouchableOpacity, 
    ActivityIndicator, 
    ScrollView, 
    Alert,
    Dimensions 
} from 'react-native';
import { auth, db } from '../firebase-init';
import { signOut } from 'firebase/auth';
import { globalStyles, colors } from '../styles/globalStyles';
import { adminDashboardStyles } from '../styles/AdminDashboardStyles';
import { Ionicons } from '@expo/vector-icons';
import { getLocales, getUser, getAllUsers } from '../services/firestoreService';
import { collection, getDocs, query, where, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

const AdminDashboard = ({ navigation }) => {
    const [locales, setLocales] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    
    // Nuevos estados para estadísticas
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [todayRevenue, setTodayRevenue] = useState(0);
    const [todaySales, setTodaySales] = useState(0);
    const [monthlySales, setMonthlySales] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [statsLoading, setStatsLoading] = useState(true);

    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userData = await getUser(user.uid);
                    setUserName(userData?.nombre || user.email || 'Administrador');
                }

                const localesList = await getLocales();
                setLocales(localesList);

                const usersList = await getAllUsers();
                setUsers(usersList);
            } catch (error) {
                console.error("Error al obtener datos: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        setupSalesListener();
    }, []);

    const setupSalesListener = () => {
        const salesCol = collection(db, "sales");
        const salesQuery = query(salesCol, orderBy('date', 'desc'));
        
        const unsubscribe = onSnapshot(salesQuery, (snapshot) => {
            const salesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log("📊 Ventas encontradas:", salesData.length);

            // Agrupar ventas
            const groupedSalesMap = {};
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
            const currentYear = today.getFullYear();

            let todayRevenue = 0;
            const todaySalesSet = new Set();

            salesData.forEach(sale => {
                const ventaId = sale.ventaId || sale.id;
                
                if (!groupedSalesMap[ventaId]) {
                    groupedSalesMap[ventaId] = {
                        ventaId: ventaId,
                        date: sale.date,
                        tipo_pago: sale.tipo_pago || sale.paymentMethod || 'efectivo',
                        productos: [],
                        totalVenta: 0,
                        localId: sale.localId
                    };
                }

                // Agregar productos
                if (sale.products && Array.isArray(sale.products)) {
                    sale.products.forEach(prod => {
                        const productName = prod.producto || prod.productName || 'Producto';
                        const quantity = prod.quantity || 1;
                        const total = prod.total || 0;
                        
                        groupedSalesMap[ventaId].productos.push({
                            producto: productName,
                            quantity: quantity,
                            total: total
                        });
                        groupedSalesMap[ventaId].totalVenta += total;
                    });
                } else {
                    const productName = sale.producto || sale.productName || 'Producto';
                    const quantity = sale.quantity || 1;
                    const total = sale.total || 0;
                    
                    groupedSalesMap[ventaId].productos.push({
                        producto: productName,
                        quantity: quantity,
                        total: total
                    });
                    groupedSalesMap[ventaId].totalVenta += total;
                }

                // Verificar si es venta de hoy
                if (sale.date && sale.date.toDate) {
                    const saleDate = sale.date.toDate();
                    if (saleDate >= startOfToday) {
                        todayRevenue += sale.total || 0;
                        todaySalesSet.add(ventaId);
                    }
                }
            });

            const groupedSalesArray = Object.values(groupedSalesMap);
            
            // Calcular estadísticas
            const totalRevenue = groupedSalesArray.reduce((sum, venta) => sum + venta.totalVenta, 0);
            const totalSalesCount = groupedSalesArray.length;

            setTotalRevenue(totalRevenue);
            setTotalSales(totalSalesCount);
            setTodayRevenue(todayRevenue);
            setTodaySales(todaySalesSet.size);
            setRecentSales(groupedSalesArray.slice(0, 5));

            // Calcular ventas mensuales
            const monthlyTotals = {};
            
            groupedSalesArray.forEach(venta => {
                if (venta.date && venta.date.toDate) {
                    const saleDate = venta.date.toDate();
                    if (saleDate.getFullYear() === currentYear) {
                        const monthName = saleDate.toLocaleString('es-ES', { month: 'short' });
                        
                        if (!monthlyTotals[monthName]) {
                            monthlyTotals[monthName] = 0;
                        }
                        monthlyTotals[monthName] += venta.totalVenta;
                    }
                }
            });

            // Crear array completo de meses
            const monthOrder = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
            const completeMonthlySales = monthOrder.map(monthName => ({
                month: monthName,
                total: monthlyTotals[monthName] || 0,
            }));

            setMonthlySales(completeMonthlySales);
            setStatsLoading(false);
        });

        return unsubscribe;
    };

    const formatNumber = (number) => {
        if (number === 0) return '0';
        const integerNumber = Math.round(number);
        return integerNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const formatTimestamp = (timestamp) => {
        try {
            if (!timestamp) return 'Fecha no disponible';
            if (timestamp.toDate) {
                const date = timestamp.toDate();
                return date.toLocaleString('es-ES', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit'
                });
            }
            return 'Formato inválido';
        } catch (error) {
            return 'Error en fecha';
        }
    };

    const getPaymentIcon = (tipoPago) => {
        const method = tipoPago?.toLowerCase();
        return method === 'efectivo' || method === 'cash' ? 'cash' : 'card';
    };

    const getPaymentText = (tipoPago) => {
        const method = tipoPago?.toLowerCase();
        return method === 'efectivo' || method === 'cash' ? 'Efectivo' : 'Transferencia';
    };

    const handleLogout = () => {
        signOut(auth).catch(error => console.error('Error al cerrar sesión:', error));
    };

    const renderRecentSale = ({ item }) => (
        <View style={adminDashboardStyles.recentSaleCard}>
            <View style={adminDashboardStyles.saleHeader}>
                <View style={adminDashboardStyles.saleInfo}>
                    <Ionicons 
                        name={getPaymentIcon(item.tipo_pago)} 
                        size={20} 
                        color={getPaymentIcon(item.tipo_pago) === 'cash' ? colors.success : colors.primaryPink} 
                    />
                    <View style={adminDashboardStyles.saleDetails}>
                        <Text style={adminDashboardStyles.saleTime}>
                            Venta {formatTimestamp(item.date)}
                        </Text>
                        <Text style={adminDashboardStyles.saleProducts}>
                            {item.productos.length} productos
                        </Text>
                    </View>
                </View>
                <View style={adminDashboardStyles.saleAmount}>
                    <Text style={adminDashboardStyles.saleTotal}>
                        ${formatNumber(item.totalVenta)}
                    </Text>
                    <View style={[
                        adminDashboardStyles.paymentBadge,
                        { backgroundColor: getPaymentIcon(item.tipo_pago) === 'cash' ? '#DCFCE7' : '#DBEAFE' }
                    ]}>
                        <Text style={[
                            adminDashboardStyles.paymentText,
                            { color: getPaymentIcon(item.tipo_pago) === 'cash' ? colors.success : colors.primaryPink }
                        ]}>
                            {getPaymentText(item.tipo_pago)}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const chartConfig = {
        backgroundColor: colors.white,
        backgroundGradientFrom: colors.white,
        backgroundGradientTo: colors.white,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(236, 72, 153, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: colors.primaryPink
        }
    };

    if (loading) {
        return (
            <View style={globalStyles.loaderContainer}>
                <ActivityIndicator size="large" color={colors.primaryPink} />
                <Text style={adminDashboardStyles.loadingText}>Cargando datos...</Text>
            </View>
        );
    }

    return (
        <View style={globalStyles.container}>
            {/* Header */}
            <View style={globalStyles.header}>
                <View>
                    <Text style={globalStyles.title}>Panel Admin</Text>
                    <Text style={adminDashboardStyles.userName}>Bienvenido, {userName}</Text>
                </View>
                <TouchableOpacity style={adminDashboardStyles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color={colors.white} />
                    <Text style={adminDashboardStyles.logoutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Estadísticas Principales */}
                <View style={adminDashboardStyles.statsSection}>
                    <Text style={globalStyles.subtitle}>Resumen General</Text>
                    <View style={adminDashboardStyles.statsGrid}>
                        <View style={adminDashboardStyles.statCard}>
                            <View style={[adminDashboardStyles.statIcon, { backgroundColor: '#FDF2F8' }]}>
                                <Ionicons name="cash" size={24} color={colors.primaryPink} />
                            </View>
                            <Text style={adminDashboardStyles.statNumber}>${formatNumber(totalRevenue)}</Text>
                            <Text style={adminDashboardStyles.statLabel}>Ingresos Totales</Text>
                        </View>

                        <View style={adminDashboardStyles.statCard}>
                            <View style={[adminDashboardStyles.statIcon, { backgroundColor: '#FDF2F8' }]}>
                                <Ionicons name="receipt" size={24} color={colors.primaryFuchsia} />
                            </View>
                            <Text style={adminDashboardStyles.statNumber}>{formatNumber(totalSales)}</Text>
                            <Text style={adminDashboardStyles.statLabel}>Total Ventas</Text>
                        </View>

                        <View style={adminDashboardStyles.statCard}>
                            <View style={[adminDashboardStyles.statIcon, { backgroundColor: '#FDF2F8' }]}>
                                <Ionicons name="business" size={24} color={colors.purple} />
                            </View>
                            <Text style={adminDashboardStyles.statNumber}>{formatNumber(locales.length)}</Text>
                            <Text style={adminDashboardStyles.statLabel}>Locales Activos</Text>
                        </View>

                        <View style={adminDashboardStyles.statCard}>
                            <View style={[adminDashboardStyles.statIcon, { backgroundColor: '#FDF2F8' }]}>
                                <Ionicons name="calendar" size={24} color={colors.blue} />
                            </View>
                            <Text style={adminDashboardStyles.statNumber}>${formatNumber(todayRevenue)}</Text>
                            <Text style={adminDashboardStyles.statLabel}>{todaySales} ventas hoy</Text>
                        </View>
                    </View>
                </View>

                {/* Gráfico de Ventas Mensuales */}
                <View style={adminDashboardStyles.chartSection}>
                    <Text style={globalStyles.subtitle}>Ventas Mensuales</Text>
                    {statsLoading ? (
                        <View style={adminDashboardStyles.chartPlaceholder}>
                            <ActivityIndicator size="large" color={colors.primaryPink} />
                            <Text style={adminDashboardStyles.loadingText}>Cargando gráfico...</Text>
                        </View>
                    ) : monthlySales.some(sale => sale.total > 0) ? (
                        <BarChart
                            data={{
                                labels: monthlySales.map(item => item.month.charAt(0).toUpperCase() + item.month.slice(1)),
                                datasets: [
                                    {
                                        data: monthlySales.map(item => item.total)
                                    }
                                ]
                            }}
                            width={screenWidth - 40}
                            height={220}
                            chartConfig={chartConfig}
                            style={adminDashboardStyles.chart}
                            showValuesOnTopOfBars={true}
                            fromZero={true}
                        />
                    ) : (
                        <View style={adminDashboardStyles.emptyChart}>
                            <Ionicons name="bar-chart-outline" size={48} color={colors.textLight} />
                            <Text style={adminDashboardStyles.emptyText}>No hay datos de ventas</Text>
                        </View>
                    )}
                </View>

                {/* Ventas Recientes */}
                <View style={adminDashboardStyles.recentSalesSection}>
                    <View style={adminDashboardStyles.sectionHeader}>
                        <Text style={globalStyles.subtitle}>Ventas Recientes</Text>
                        <TouchableOpacity 
                            style={adminDashboardStyles.viewAllButton}
                            onPress={() => navigation.navigate('SalesHistory', { localId: 'all' })}
                        >
                            <Text style={adminDashboardStyles.viewAllText}>Ver Todo</Text>
                            <Ionicons name="chevron-forward" size={16} color={colors.primaryPink} />
                        </TouchableOpacity>
                    </View>

                    {statsLoading ? (
                        <View style={adminDashboardStyles.loadingContainer}>
                            <ActivityIndicator size="small" color={colors.primaryPink} />
                            <Text style={adminDashboardStyles.loadingText}>Cargando ventas...</Text>
                        </View>
                    ) : recentSales.length > 0 ? (
                        <FlatList
                            data={recentSales}
                            renderItem={renderRecentSale}
                            keyExtractor={item => item.ventaId}
                            scrollEnabled={false}
                            contentContainerStyle={adminDashboardStyles.recentSalesList}
                        />
                    ) : (
                        <View style={adminDashboardStyles.emptyState}>
                            <Ionicons name="receipt-outline" size={48} color={colors.textLight} />
                            <Text style={adminDashboardStyles.emptyText}>No hay ventas recientes</Text>
                        </View>
                    )}
                </View>

                {/* Gestión de Locales */}
                <View style={adminDashboardStyles.managementSection}>
                    <Text style={globalStyles.subtitle}>Gestión Rápida</Text>
                    <View style={adminDashboardStyles.managementGrid}>
                        <TouchableOpacity 
                            style={adminDashboardStyles.managementCard}
                            onPress={() => navigation.navigate('LocalManagement')}
                        >
                            <View style={[adminDashboardStyles.managementIcon, { backgroundColor: '#FDF2F8' }]}>
                                <Ionicons name="business" size={24} color={colors.primaryPink} />
                            </View>
                            <Text style={adminDashboardStyles.managementText}>Gestión de Locales</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={adminDashboardStyles.managementCard}
                            onPress={() => navigation.navigate('UserManagement')}
                        >
                            <View style={[adminDashboardStyles.managementIcon, { backgroundColor: '#F0F9FF' }]}>
                                <Ionicons name="people" size={24} color={colors.blue} />
                            </View>
                            <Text style={adminDashboardStyles.managementText}>Gestión de Usuarios</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={adminDashboardStyles.managementCard}
                            onPress={() => navigation.navigate('SalesHistory', { localId: 'all' })}
                        >
                            <View style={[adminDashboardStyles.managementIcon, { backgroundColor: '#F0FDF4' }]}>
                                <Ionicons name="bar-chart" size={24} color={colors.success} />
                            </View>
                            <Text style={adminDashboardStyles.managementText}>Historial Completo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={adminDashboardStyles.managementCard}
                            onPress={() => navigation.navigate('AdminMigration')}
                        >
                            <View style={[adminDashboardStyles.managementIcon, { backgroundColor: '#FEFCE8' }]}>
                                <Ionicons name="sync" size={24} color={colors.warning} />
                            </View>
                            <Text style={adminDashboardStyles.managementText}>Migrar Ventas</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default AdminDashboard;