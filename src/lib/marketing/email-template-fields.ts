import type { Field } from 'payload'

import { DEFAULT_CURRENCY } from '@/lib/finance'

import { systemEmailTemplateDefaults } from './email-templates'

export function buildEmailTemplateEditableFields(): Field[] {
  return [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Template Name',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
    },
    {
      name: 'preheader',
      type: 'text',
      required: true,
    },
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'ctaLabel',
      type: 'text',
      required: true,
      label: 'CTA Label',
    },
    {
      name: 'ctaUrl',
      type: 'text',
      required: true,
      label: 'CTA URL',
    },
    {
      name: 'campaignName',
      type: 'text',
      required: true,
      label: 'Campaign Name',
    },
    {
      name: 'fromName',
      type: 'text',
      required: true,
      label: 'From Name',
    },
    {
      name: 'fromEmail',
      type: 'email',
      required: true,
      label: 'From Email',
    },
    {
      name: 'replyToEmail',
      type: 'email',
      required: true,
      label: 'Reply-To Email',
    },
    {
      name: 'organizationName',
      type: 'text',
      required: true,
      label: 'Organization Name',
    },
    {
      name: 'address',
      type: 'text',
      required: true,
    },
    {
      name: 'city',
      type: 'text',
      required: true,
    },
    {
      name: 'province',
      type: 'text',
      required: true,
    },
    {
      name: 'postalCode',
      type: 'text',
      required: true,
      label: 'Postal Code',
    },
    {
      name: 'country',
      type: 'text',
      required: true,
    },
    {
      name: 'brandColor',
      type: 'text',
      required: true,
      defaultValue: '#5151eb',
      label: 'Brand Color',
    },
    {
      name: 'secondaryColor',
      type: 'text',
      required: true,
      defaultValue: '#eef2ff',
      label: 'Secondary Color',
    },
    {
      name: 'backgroundColor',
      type: 'text',
      required: true,
      defaultValue: '#f5f7ff',
      label: 'Background Color',
    },
    {
      name: 'cardBackground',
      type: 'text',
      required: true,
      defaultValue: '#ffffff',
      label: 'Card Background',
    },
    {
      name: 'bodyTextColor',
      type: 'text',
      required: true,
      defaultValue: '#3f3f46',
      label: 'Body Text Color',
    },
    {
      name: 'headingColor',
      type: 'text',
      required: true,
      defaultValue: '#18181b',
      label: 'Heading Color',
    },
    {
      name: 'footerTextColor',
      type: 'text',
      required: true,
      defaultValue: '#6b7280',
      label: 'Footer Text Color',
    },
    {
      name: 'buttonTextColor',
      type: 'text',
      required: true,
      defaultValue: '#ffffff',
      label: 'Button Text Color',
    },
    {
      name: 'fontFamily',
      type: 'text',
      required: true,
      defaultValue: 'Arial, sans-serif',
      label: 'Font Family',
    },
    {
      name: 'borderRadius',
      type: 'number',
      required: true,
      defaultValue: 16,
      min: 0,
      label: 'Border Radius',
    },
  ]
}

export const SYSTEM_EMAIL_TEMPLATE_DEFAULT_MAP = Object.fromEntries(
  systemEmailTemplateDefaults.map((template) => [template.key, template]),
) as Record<string, (typeof systemEmailTemplateDefaults)[number]>

export { DEFAULT_CURRENCY }
