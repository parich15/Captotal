import test from 'node:test'
import assert from 'node:assert/strict'
import { captchaValido, crearLimitador, emailFormulario, ipFormulario, telefonoFormulario, textoFormulario } from '../server/utils/formularios.mjs'

test('campos estrictos: no convierten objetos, números ni espacios en datos válidos', () => {
    for (const valor of [{}, [], null, 123, '', '   ', 'dato\ninyectado']) assert.equal(textoFormulario(valor), null)
    assert.equal(textoFormulario(' Ana '), 'Ana')
    for (const valor of [{}, 'correo', 'a@b', 'a..b@dominio.com', '.a@dominio.com', 'a@-dominio.com', 'a@dominio..com', 'a b@dominio.com']) assert.equal(emailFormulario(valor), null)
    assert.equal(emailFormulario(' Ana+curso@Ejemplo.com '), 'ana+curso@ejemplo.com')
    for (const valor of [123456789, {}, '1234', '+34abc123456789', '1234567890123456']) assert.equal(telefonoFormulario(valor), null)
    assert.equal(telefonoFormulario('+34 600 123 456'), '+34 600 123 456')
})

test('limitador acotado: bloquea abuso, expira y falla cerrado al alcanzar capacidad', () => {
    const permitir = crearLimitador({ max: 2, ventana: 100, capacidad: 2 })
    assert.equal(permitir('a', 0), true)
    assert.equal(permitir('a', 1), true)
    assert.equal(permitir('a', 2), false)
    assert.equal(permitir('b', 3), true)
    assert.equal(permitir('c', 4), false)
    assert.equal(permitir('c', 100), true)
})

test('sólo los proxies configurados pueden aportar X-Real-IP', () => {
    assert.equal(ipFormulario('203.0.113.3', '198.51.100.2', '127.0.0.1'), '203.0.113.3')
    assert.equal(ipFormulario('127.0.0.1', '198.51.100.2', '127.0.0.1'), '198.51.100.2')
    assert.equal(ipFormulario('127.0.0.1', 'inventada', '127.0.0.1'), '127.0.0.1')
})

test('captcha v3 exige éxito, dominio, acción newsletter y puntuación numérica suficiente', () => {
    const respuesta = { success: true, hostname: 'captotal.com', action: 'newsletter', score: 0.9, challenge_ts: '2026-10-19T08:00:00Z' }
    assert.equal(captchaValido(respuesta, 'captotal.com,www.captotal.com'), true)
    assert.equal(captchaValido({ ...respuesta, score: 0.5 }, 'captotal.com'), true)
    assert.equal(captchaValido({ ...respuesta, score: 0.3 }, 'captotal.com', 0.3), true)
    for (const cambios of [{ success: false }, { hostname: 'atacante.com' }, { hostname: null }, { action: undefined }, { action: 'contacto' }, { action: 'Newsletter' }, { score: undefined }, { score: null }, { score: '0.9' }, { score: NaN }, { score: Infinity }, { score: -1 }, { score: 0.49 }, { score: 1.01 }]) {
        assert.equal(captchaValido({ ...respuesta, ...cambios }, 'captotal.com'), false)
    }
    assert.equal(captchaValido(respuesta, ''), false)
    for (const minimo of [NaN, Infinity, -0.1, 1.1, '0.5']) assert.equal(captchaValido(respuesta, 'captotal.com', minimo), false)
})
