/**
 * NexShop Fraud SDK - Módulo Frontend
 *
 * Responsável por coletar dados de device fingerprint e comportamento do usuário
 * de forma passiva e enviá-los para o backend para análise.
 */
const NexShopFraudSDK = (() => {
    let config = {
        backendUrl: '', // URL do endpoint do backend
    };

    let behaviorData = {
        startTime: performance.now(),
        timeOnPage: 0,
        mouseMovementDistance: 0,
        lastMousePos: { x: 0, y: 0 },
        clicks: 0,
        tabFocusChanges: 0,
    };

    // --- Funções de Coleta de Dados ---

    const getDeviceFingerprint = () => {
        return {
            userAgent: navigator.userAgent,
            language: navigator.language,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            pixelRatio: window.devicePixelRatio,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
    };

    const updateBehaviorData = () => {
        behaviorData.timeOnPage = Math.round(performance.now() - behaviorData.startTime);
    };

    // --- Listeners de Eventos para Coleta Comportamental ---

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        if (behaviorData.lastMousePos.x !== 0) {
            const dx = clientX - behaviorData.lastMousePos.x;
            const dy = clientY - behaviorData.lastMousePos.y;
            behaviorData.mouseMovementDistance += Math.sqrt(dx * dx + dy * dy);
        }
        behaviorData.lastMousePos = { x: clientX, y: clientY };
    };

    const handleClick = () => {
        behaviorData.clicks++;
    };

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' || document.visibilityState === 'visible') {
            behaviorData.tabFocusChanges++;
        }
    };

    // --- Métodos Públicos do SDK ---

    const init = (userConfig) => {
        config = { ...config, ...userConfig };
        
        // Remove listeners antigos para evitar duplicação se init for chamado mais de uma vez
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleClick);
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        // Adiciona os listeners de eventos
        document.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('click', handleClick, { passive: true });
        document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });

        console.log('SDK de Fraude inicializado.');
    };

    const sendData = async (contextData) => {
        updateBehaviorData();

        const payload = {
            device: getDeviceFingerprint(),
            behavior: {
                timeOnPage: behaviorData.timeOnPage,
                mouseMovementDistance: Math.round(behaviorData.mouseMovementDistance),
                clicks: behaviorData.clicks,
                tabFocusChanges: behaviorData.tabFocusChanges,
            },
            context: contextData,
        };
        
        try {
            const response = await fetch(config.backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                // Captura respostas de erro do servidor (ex: 400, 500)
                const errorBody = await response.json().catch(() => ({ message: `Erro HTTP ${response.status}` }));
                throw new Error(errorBody.message || `O servidor respondeu com o status ${response.status}`);
            }

            return await response.json();

        } catch (error) {
            // Captura erros de rede (ex: CORS, backend offline)
            console.error('Erro ao enviar dados para o SDK de fraude:', error);
            return {
                status: 'error',
                score: -1,
                message: `Não foi possível comunicar com o servidor de análise. Verifique a consola (F12) para mais detalhes. (${error.message})`,
                triggeredRules: [],
            };
        }
    };

    return {
        init,
        sendData,
    };
})();

// Expõe o SDK no objeto window para ser acessível globalmente
window.NexShopFraudSDK = NexShopFraudSDK;

