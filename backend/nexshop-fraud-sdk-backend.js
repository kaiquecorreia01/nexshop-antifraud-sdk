/**
 * NexShop Fraud SDK - Módulo Backend
 *
 * Esta classe fornece um middleware para Express.js para analisar os dados de fraude
 * enviados pelo SDK do frontend, aplicando um conjunto de regras configuráveis
 * para gerar um score de risco e retornar uma decisão.
 */
class NexShopFraudSDK {
    /**
     * @param {object} config - Objeto de configuração.
     * @param {Array<object>} config.rules - Um array de regras para análise de risco.
     * @param {object} [config.userHistoryDB] - Um banco de dados simulado para histórico de usuários.
     */
    constructor(config) {
        this.rules = config.rules || [];
        // Simulação de um banco de dados de histórico do usuário para fins de demonstração
        this.userHistoryDB = config.userHistoryDB || {
            'user123': {
                lastIp: '::1',
                lastDevice: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36 OPR/121.0.0.0 (Edition std-2)',
                loginCount: 5,
            },
            'user456': {
                lastIp: '200.150.10.5',
                lastDevice: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
                loginCount: 2,
            }
        };

        // Garante que o método `middleware` tenha o `this` correto quando usado pelo Express
        this.middleware = this.middleware.bind(this);
    }

    /**
     * Analisa os dados de fraude com base nas regras configuradas.
     * @param {object} fraudData - Os dados coletados pelo SDK do frontend.
     * @returns {object} - O resultado da análise contendo status, score e regras acionadas.
     */
    analyze(fraudData) {
        let totalScore = 0;
        const triggeredRules = [];

        // Adiciona dados históricos à análise, se o usuário existir
        const userHistory = this.userHistoryDB[fraudData.context.userId];
        if (userHistory) {
            fraudData.history = userHistory;
        }

        // Aplica cada regra aos dados
        this.rules.forEach(rule => {
            try {
                if (rule.condition(fraudData)) {
                    totalScore += rule.score_impact;
                    triggeredRules.push({
                        name: rule.name,
                        message: rule.message,
                        status: rule.status,
                    });
                }
            } catch (error) {
                console.error(`Erro ao executar a regra "${rule.name}":`, error);
            }
        });

        // Determina o status final com base no score total
        let finalStatus = 'allow';
        if (totalScore >= 50 && totalScore < 100) {
            finalStatus = 'review';
        } else if (totalScore >= 100) {
            finalStatus = 'deny';
        }

        const finalMessage = triggeredRules.length > 0
            ? triggeredRules.map(r => r.message).join(', ')
            : 'Nenhuma atividade suspeita detectada.';

        return {
            status: finalStatus,
            score: totalScore,
            message: finalMessage,
            triggeredRules: triggeredRules.map(r => r.name),
        };
    }

    /**
     * Middleware para Express.js.
     */
    middleware(req, res, next) {
        // Extrai o endereço IP do cliente (confiável no backend)
        const clientIp = req.ip;
        const fraudData = {
            device: req.body.device,
            behavior: req.body.behavior,
            context: req.body.context,
            clientIp: clientIp,
        };

        // Validação básica dos dados recebidos
        if (!fraudData.device || !fraudData.behavior || !fraudData.context) {
            return res.status(400).json({ error: 'Dados de fraude incompletos.' });
        }

        const analysisResult = this.analyze(fraudData);

        // Anexa o resultado da análise ao objeto `req` para que rotas futuras possam usá-lo
        req.fraudAnalysis = analysisResult;

        // Retorna a resposta diretamente para o endpoint /identity/verify
        return res.status(200).json(analysisResult);
    }
}

module.exports = NexShopFraudSDK;