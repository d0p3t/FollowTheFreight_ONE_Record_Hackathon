import express from 'express';
import LufthansaApi from '../apis/airlines/lufthansaApi';
import QatarApi from '../apis/airlines/qatarApi';
import KLMApi from '../apis/airlines/klmApi';
import ShipmentInfo from '../types/shipmentInfo';
const router = express.Router();

// Instantiate these objects using dotenv config later
const klm = new KLMApi('ubne6w8ytcrneh3fa7msmnw2', 'ky3sytdTHX');
const lh = new LufthansaApi('9hn5y65a3rva6mzmdtw87hz2', 'QbTUakVtMsMcWyzCcDTh');
const qt = new QatarApi('ORQRUSER1', '0901ce169c7c960a488e4e1c58d50ca1056eaf01288fef8b718223bf92b58883');

router.get('/single/:awb', async (req, res) => {
  const awb = req.params.awb;
  if (awb === undefined) {
    res.json({ status: 123 });
  }

  const prefix = awb.split('-')[0];
  let info: ShipmentInfo = { status: 400, error: 'Invalid AWB Prefix', airwayBillNumber: awb };
  switch (prefix) {
    case '020':
      info = await lh.getShipmentInfo(awb);
      break;
    case '157':
      info = await qt.getShipmentInfo(awb);
      break;
    case '057':
      info = await klm.getShipmentInfo(awb);
      break;
    default:
      break;
  }

  res.json(info);
});

router.get('/:awbs', async (req, res) => {
  const airwayBills = req.params.awbs?.split(',');

  if (airwayBills === undefined || airwayBills.length === 0) {
    res.json({ error: 'No AWBs specified.' });
    return;
  }

  const shipmentInfos: ShipmentInfo[] = [];

  for (let index = 0; index < airwayBills.length; index++) {
    const awb = airwayBills[index];
    const prefix = awb.split('-')[0];
    let info: ShipmentInfo = { status: 500, error: 'Invalid AWB Prefix', airwayBillNumber: awb };
    switch (prefix) {
      case '020':
        info = await lh.getShipmentInfo(awb);
        break;
      case '157':
        info = await qt.getShipmentInfo(awb);
        break;
      case '057':
        info = await klm.getShipmentInfo(awb);
        break;
      default:
        break;
    }
    shipmentInfos.push(info);
  }

  res.json(shipmentInfos);
});

export default router;
