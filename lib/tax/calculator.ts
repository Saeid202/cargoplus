export type CanadianProvince =
  | 'AB'
  | 'BC'
  | 'MB'
  | 'NB'
  | 'NL'
  | 'NS'
  | 'NT'
  | 'NU'
  | 'ON'
  | 'PE'
  | 'QC'
  | 'SK'
  | 'YT'

export interface TaxBreakdown {
  province: CanadianProvince
  provinceName: string
  taxType: 'GST' | 'HST' | 'GST+PST' | 'GST+QST'
  taxLabel: string
  taxRate: number
  taxAmount: number
  subtotal: number
  total: number
}

interface ProvinceConfig {
  name: string
  taxType: TaxBreakdown['taxType']
  rate: number
}

const PROVINCE_CONFIG: Record<CanadianProvince, ProvinceConfig> = {
  AB: { name: 'Alberta',                      taxType: 'GST',     rate: 0.05      },
  BC: { name: 'British Columbia',             taxType: 'GST+PST', rate: 0.12      },
  MB: { name: 'Manitoba',                     taxType: 'GST+PST', rate: 0.12      },
  NB: { name: 'New Brunswick',                taxType: 'HST',     rate: 0.15      },
  NL: { name: 'Newfoundland and Labrador',    taxType: 'HST',     rate: 0.15      },
  NS: { name: 'Nova Scotia',                  taxType: 'HST',     rate: 0.15      },
  NT: { name: 'Northwest Territories',        taxType: 'GST',     rate: 0.05      },
  NU: { name: 'Nunavut',                      taxType: 'GST',     rate: 0.05      },
  ON: { name: 'Ontario',                      taxType: 'HST',     rate: 0.13      },
  PE: { name: 'Prince Edward Island',         taxType: 'HST',     rate: 0.15      },
  QC: { name: 'Quebec',                       taxType: 'GST+QST', rate: 0.14975   },
  SK: { name: 'Saskatchewan',                 taxType: 'GST+PST', rate: 0.11      },
  YT: { name: 'Yukon',                        taxType: 'GST',     rate: 0.05      },
}

function taxLabel(taxType: TaxBreakdown['taxType'], rate: number): string {
  const pct = (rate * 100).toString().replace(/\.?0+$/, '')
  return `${taxType} (${pct}%)`
}

export function calculateTax(subtotal: number, province: CanadianProvince): TaxBreakdown {
  const config = PROVINCE_CONFIG[province]
  const taxAmount = Math.round(subtotal * config.rate * 100) / 100

  return {
    province,
    provinceName: config.name,
    taxType: config.taxType,
    taxLabel: taxLabel(config.taxType, config.rate),
    taxRate: config.rate,
    taxAmount,
    subtotal,
    total: subtotal + taxAmount,
  }
}
