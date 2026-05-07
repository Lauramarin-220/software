/**
 * define la barra de navegacion inferior (tab Bar) de app
 * expo Router usa este archivo como el contenedor de todas las pantallas 
 * que viven de la carpet (tabs) 
 */

//tabs componente de expo Router que genera la barra de pestañas inferior 
import { Tabs } from 'expo-router';
// React necessario para que JSX funcione correctamente
import React from 'react';
// Haptictab version personalizada del boton de la pestaña que agrega vibracion tactil (haptic feedback) al presionar 
// el tab 
import { HapticTab } from '@/components/haptic-tab';
//IconSymbols componente que muestra  iconos SF symbols IOS y material de android 
import { IconSymbol } from '@/components/ui/icon-symbol';
// colors objeto de colores del tema de app claro y oscuro
import { Colors } from '@/constans/theme';
// useColorShema hook que detecta si el dispositivo esta en modo claro o oscuro
import { useColorScheme } from '@/hooks/use-color-scheme';

// TabLayout componente principal que configura toda la barra de navegacion 
// expo Router lo exporta como default y lo monta automaticamente 
export default function TabLaLayout() {
    //ColorShema valor 'light' o dark segu la preferencia del sistema
    const colorSheme = useColorScheme();

    return (
        // Tabs renderizan la barra de pestañas inferior y gestiona que la pantalla este activa en cada momento
        <Tabs 
        screenOptions= {{
            //TabbarActiveintColor color del icono y texto de la pestaña activa
            //sincolorSheme es null (no detectado) usa light por defecto
            tabBarActiveTintColor: Colors[colorSheme ?? 'light'].tint,
            //headerShown false oculta en el encabezado superior en todas las pantallas
            headerShown: false,
            //tabBarButton remplaza el boton estandar por hapticTab con vibracion
            tabBarButton: HapticTab,

        }}>

        {/** pestaña 1 tienda
         * name=index -> apunta al archivo/index.tsx (pantalla principal)
         */}      
        <Tabs.Screen
            name="index"
            options={{
                //Texto que aparece debajo del icono de la barra
                title: 'Tienda Adso',
                //tabBarIcon funcion recibe el color activo o inactivo y devuelve el icono
                //house.fill = icono de casa rellena (representa el icono de la tienda)
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
            />
        {/** pestaña 2 carrito
         * name=carrito -> apunta al archivo/carrito.tsx (pantalla principal)
         */}      
            <Tabs.Screen
            name="carrito"
            options={{
                //Texto que aparece debajo del icono de la barra
                title: 'Carrito',
                //tabBarIcon funcion recibe el color activo o inactivo y devuelve el icono
                //house.fill = icono de casa rellena (representa el icono de la tienda)
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="cart.fill" color={color} />,
            }}
        />

        {/** pestaña 2 carrito
         * name=carrito -> apunta al archivo/carrito.tsx (pantalla principal)
         */}      
            <Tabs.Screen
            name="explore"
            options={{
                //Texto que aparece debajo del icono de la barra
                title: 'Cuenta',
                //tabBarIcon funcion recibe el color activo o inactivo y devuelve el icono
                //house.fill = icono de casa rellena (representa el icono de la tienda)
                tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.circle" color={color} />,
            }}
        />
        </Tabs>
    )
}

