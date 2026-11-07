/**
 * StudioOps End-to-End Integration Verification Suite
 * Verifies:
 * 1. Trends fetch & mapping
 * 2. Script generation & Growth metadata
 * 3. Colab Media Dispatch payload formatting
 * 4. Job status polling simulator
 * 5. Metrics & CSV retention analysis
 */

import {
  fetchTrendsApi,
  generateScriptApi,
  dispatchMediaRenderApi,
  pollJobStatusApi,
  analyzeMetricsApi,
} from '../services/api'

async function runE2eTestSuite() {
  console.log('🧪 Iniciando Suíte de Testes E2E do StudioOps...\n')

  let passed = 0
  let failed = 0

  // Test 1: Trends Fetch
  try {
    console.log('1️⃣ Testando busca e mapeamento de Tendências...')
    const trendsResult = await fetchTrendsApi()
    if (trendsResult.trends.length >= 3 && trendsResult.trends[0].tag) {
      console.log(`   ✅ Sucesso! ${trendsResult.trends.length} tendências carregadas (Fonte: ${trendsResult.source})`)
      passed++
    } else {
      throw new Error('Tendências vazias ou inválidas')
    }
  } catch (e: any) {
    console.error('   ❌ Falha no Teste 1:', e.message)
    failed++
  }

  // Test 2: Script & Growth SEO Generation
  try {
    console.log('\n2️⃣ Testando Geração de Roteiro e Metadados do Growth Hacker...')
    const scriptResult = await generateScriptApi(
      'Como a IA cria vídeos em segundos',
      'Cyberpunk',
      '15s',
      'pt-BR-FranciscaNeural'
    )

    if (
      scriptResult.script.scenes.length === 3 &&
      scriptResult.growth.title &&
      scriptResult.growth.hashtags.length > 0
    ) {
      console.log(`   ✅ Sucesso! Roteiro gerado com ${scriptResult.script.scenes.length} cenas (Fonte: ${scriptResult.source})`)
      console.log(`      Título SEO: "${scriptResult.growth.title}"`)
      console.log(`      Hashtags: ${scriptResult.growth.hashtags.slice(0, 4).join(' ')}`)
      passed++
    } else {
      throw new Error('Estrutura de roteiro ou metadados inválida')
    }
  } catch (e: any) {
    console.error('   ❌ Falha no Teste 2:', e.message)
    failed++
  }

  // Test 3: Media Dispatch Payload Formatting
  try {
    console.log('\n3️⃣ Testando Despacho de Mídia para Worker...')
    const mockScript = {
      topic: 'IA Autônoma',
      styleName: 'Cyberpunk',
      duration: '15s' as const,
      scenes: [
        {
          order: 1,
          type: 'hook' as const,
          timeRange: '0-3s',
          narrationText: 'Você ainda perde horas editando?',
          imagePromptEnglish: 'Glowing cybernetic eye, vertical 9:16',
        },
      ],
      fullNarration: 'Você ainda perde horas editando?',
    }
    const mockGrowth = {
      title: 'IA Autônoma',
      description: 'Descubra a tecnologia',
      hashtags: ['#viral', '#ia'],
    }

    const dispatchRes = await dispatchMediaRenderApi(mockScript, mockGrowth, 'pt-BR-FranciscaNeural')
    if (dispatchRes.success && dispatchRes.jobId) {
      console.log(`   ✅ Sucesso! Job criado com ID: ${dispatchRes.jobId} (Fonte: ${dispatchRes.source})`)
      passed++
    } else {
      throw new Error('Despacho falhou')
    }
  } catch (e: any) {
    console.error('   ❌ Falha no Teste 3:', e.message)
    failed++
  }

  // Test 4: Job Status Polling
  try {
    console.log('\n4️⃣ Testando Consulta de Status do Job...')
    const pollRes = await pollJobStatusApi('job_test_123')
    if (pollRes.status && typeof pollRes.progress === 'number') {
      console.log(`   ✅ Sucesso! Status retornado: ${pollRes.status} (${pollRes.progress}%)`)
      passed++
    } else {
      throw new Error('Status inválido retornado')
    }
  } catch (e: any) {
    console.error('   ❌ Falha no Teste 4:', e.message)
    failed++
  }

  // Test 5: Metrics & CSV Retention Analysis
  try {
    console.log('\n5️⃣ Testando Análise de Métricas & Diagnóstico de Retenção...')
    const sampleCsv = `video_id,watch_time_avg,retention_3s,shares,comments
vid_001,13.5,82.4,3200,850
vid_002,14.1,86.1,4100,1200`
    const metricsRes = await analyzeMetricsApi(sampleCsv)

    if (metricsRes.metrics.length > 0 && metricsRes.tips.length > 0) {
      console.log(`   ✅ Sucesso! ${metricsRes.metrics.length} métricas e ${metricsRes.tips.length} dicas de retenção geradas`)
      console.log(`      Score Geral: ${metricsRes.overallScore}/100`)
      passed++
    } else {
      throw new Error('Métricas ou dicas vazias')
    }
  } catch (e: any) {
    console.error('   ❌ Falha no Teste 5:', e.message)
    failed++
  }

  console.log('\n' + '='.repeat(50))
  console.log(`📊 RESULTADO DOS TESTES E2E: ${passed} PASSARAM / ${failed} FALHARAM`)
  console.log('='.repeat(50))

  if (failed > 0) {
    process.exit(1)
  }
}

runE2eTestSuite()
