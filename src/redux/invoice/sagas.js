import {put, call, delay, takeLatest} from 'redux-saga/effects'
import { v4 as uuidv4 } from 'uuid'
import actions, {types} from './actions'
// import api from '../../utils/api';

/*
  TODO
  First function name (i.e. setMessage): getStoredInvoices
  First action name (i.e. SET_MESSAGE): GET_STORED_INVOICES
  First action payload param (i.e. guid): query
*/

export const getStoredInvoices = function *({payload: {}}) {
  yield put(actions.setLoading(true))

  try {
    const invoices = JSON.parse(localStorage.getItem('invoicesHistory'))

    yield put(actions.setInvoices(invoices))
  } catch (error) {
    yield put(actions.setError(`${error?.status} ${error?.message}`))
  } finally {
    yield delay(300)
    yield put(actions.setLoading(false))
  }
}

export const getStoredInvoice = function *({payload: {uuid}}) {
  yield put(actions.setLoading(true))

  try {
    const invoices = JSON.parse(localStorage.getItem('invoicesHistory'))
    const invoice = invoices.find((invoice, index) => (String(invoice.uuid) === String(uuid) || Number(uuid) === index))

    yield put(actions.setInvoice(invoice))
  } catch (error) {
    yield put(actions.setError(`${error?.status} ${error?.message}`))
  } finally {
    yield delay(300)
    yield put(actions.setLoading(false))
  }
}

export const lockInvoice = function *({payload: {uuid}}) {
  yield put(actions.setLoading(true))

  try {
    const invoices = JSON.parse(localStorage.getItem('invoicesHistory'))
    const invoiceIndex = invoices.findIndex((invoice, index) => (String(invoice.uuid) === String(uuid)))
    invoices[invoiceIndex].invoiceMeta.locked = true

    localStorage.setItem('invoicesHistory', JSON.stringify(invoices))
    yield put(actions.setInvoices(invoices))

  } catch (error) {
    yield put(actions.setError(`${error?.status} ${error?.message}`))
  } finally {
    yield delay(300)
    yield put(actions.setLoading(false))
  }
}

export const deleteInvoice = function *({payload: {uuid}}) {
  yield put(actions.setLoading(true))

  try {
    const invoices = JSON.parse(localStorage.getItem('invoicesHistory'))
    const invoiceIndex = invoices.findIndex((invoice, index) => (String(invoice.uuid) === String(uuid)))
    invoices.splice(invoiceIndex, 1)

    localStorage.setItem('invoicesHistory', JSON.stringify(invoices))
    yield put(actions.setInvoices(invoices))

  } catch (error) {
    yield put(actions.setError(`${error?.status} ${error?.message}`))
  } finally {
    yield delay(300)
    yield put(actions.startNewInvoice())
    yield put(actions.setLoading(false))
  }
}

export const storeNewInvoice = function *({payload: {invoice}}) {
  yield put(actions.setLoading(true))

  // generating ID for this new invoice
  const newUuid = uuidv4()

  try {
    const invoices = localStorage.getItem('invoicesHistory') ? JSON.parse(localStorage.getItem('invoicesHistory')) : []

    if (invoice.uuid) {
      const invoiceIndex = invoices.findIndex((item, index) => (String(invoice.uuid) === String(item.uuid)))
      invoices[invoiceIndex] = {...invoice}
    } else {
      const uniqueInvoice = {
        ...invoice,
        uuid: newUuid
      }

      invoices.push(uniqueInvoice)
    }

    localStorage.setItem('invoicesHistory', JSON.stringify(invoices))

    yield put(actions.setInvoices(invoices))
    yield put(actions.getInvoice(newUuid))
  } catch (error) {
    yield put(actions.setError(`${error?.status} ${error?.message}`))
  } finally {
    yield delay(300)
    yield put(actions.setLoading(false))
  }
}

export default [
  takeLatest(types.GET_STORED_INVOICES, getStoredInvoices),
  takeLatest(types.GET_STORED_INVOICE, getStoredInvoice),
  takeLatest(types.STORE_NEW_INVOICE, storeNewInvoice),
  takeLatest(types.LOCK_INVOICE, lockInvoice),
  takeLatest(types.DELETE_INVOICE, deleteInvoice),
]
