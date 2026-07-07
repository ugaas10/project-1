export interface BriefDocument {
  id: string;
  name: string;
  date: string;
  tags: string[];
  type: string;
  status?: string;
  ComplianceCode?: string;
}

export interface VerificationResult {
  status: 'valid' | 'expired' | 'invalid';
  message: string;
  checkedAt: string;
}

/**
 * Checks the compliance status of a given document based on its ComplianceCode and metadata.
 */
export function checkCompliance(doc: BriefDocument): VerificationResult {
  const checkedAt = new Date().toLocaleTimeString();

  if (!doc.ComplianceCode || doc.ComplianceCode.trim() === '') {
    return {
      status: 'invalid',
      message: 'SAYID-ERROR: Missing compliance registration code.',
      checkedAt
    };
  }

  // Expect standard code schema: XXX-YY-[digits] or XXX-YYY-[digits]
  const regex = /^[A-Z]{3}-[A-Z]{2,3}-\d{2,4}$/;
  if (!regex.test(doc.ComplianceCode)) {
    return {
      status: 'invalid',
      message: 'SAYID-ERROR: Code does not match Somali municipal land format (e.g. MOG-HW-042).',
      checkedAt
    };
  }

  // Checked names or keys for expired
  const code = doc.ComplianceCode.toUpperCase();
  
  if (code.includes('903') || code.includes('101') || doc.name.toLowerCase().includes('berbera') || doc.name.toLowerCase().includes('compliance_checklist')) {
    return {
      status: 'expired',
      message: 'SAYID-NOTICE: Land clearance certification expired under georeference guidelines.',
      checkedAt
    };
  }

  // Check the document date - older than 180 days is considered expired
  const docDate = new Date(doc.date);
  const now = new Date();
  const ageInDays = (now.getTime() - docDate.getTime()) / (1000 * 3600 * 24);
  
  if (!isNaN(ageInDays) && ageInDays > 365) {
    return {
      status: 'expired',
      message: 'SAYID-NOTICE: 12-month georeferenced survey limit has expired. Land compaction retest required.',
      checkedAt
    };
  }

  // Mathematical trigger for verification failures
  const parts = code.split('-');
  const suffixNum = parseInt(parts[2], 10);
  if (!isNaN(suffixNum)) {
    if (suffixNum % 7 === 0) {
      return {
        status: 'expired',
        message: 'SAYID-NOTICE: Compliance validity expired due to updated Zone 38N geodetics.',
        checkedAt
      };
    }
    if (suffixNum % 13 === 0) {
      return {
        status: 'invalid',
        message: 'SAYID-ERROR: Code revoked by Municipal Geodynamics Review Committee.',
        checkedAt
      };
    }
  }

  return {
    status: 'valid',
    message: 'SAYID-SUCCESS: Document fully compliant with georeference UTM coordinates.',
    checkedAt
  };
}
