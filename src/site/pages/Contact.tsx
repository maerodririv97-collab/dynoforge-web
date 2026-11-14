import { useState, type FormEvent } from 'react';
import { Clock, Mail, MapPin } from 'lucide-react';
import { Field, Input, Select, Textarea } from '../../components/ui';
import { COMPANY, EQUIPMENT } from '../content';
import { PageHero } from '../SiteLayout';
import { WhatsAppButton, WhatsAppIcon, whatsappUrl } from '../whatsapp';

export default function Contact() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [interest, setInterest] = useState(EQUIPMENT[0]?.name ?? '');
  const [message, setMessage] = useState('');

  // Sin backend: el formulario arma el mensaje y abre WhatsApp con el texto listo.
  function submit(e: FormEvent) {
    e.preventDefault();
    const text = [
      `Hola DynoForge, soy ${name.trim()}${city.trim() ? ` de ${city.trim()}` : ''}.`,
      `Me interesa: ${interest}.`,
      message.trim(),
    ]
      .filter(Boolean)
      .join('\n');
    window.open(whatsappUrl(text), '_blank', 'noopener,noreferrer');
  }

  const items = [
    { icon: WhatsAppIcon, label: 'WhatsApp', value: COMPANY.whatsappDisplay, href: whatsappUrl() },
    { icon: Mail, label: 'Correo', value: COMPANY.email, href: `mailto:${COMPANY.email}` },
    { icon: MapPin, label: 'Ubicación', value: COMPANY.city },
    { icon: Clock, label: 'Horario', value: COMPANY.hours },
  ];

  return (
    <>
      <PageHero eyebrow="Contáctenos" title="Hablemos de tu taller" text="Escríbenos y un asesor te responde con la información y cotización del equipo que necesitas." />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:px-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-[#25D366]/30 bg-[#25D366]/10 p-6">
            <p className="text-lg font-semibold">La forma más rápida</p>
            <p className="mt-1 text-sm text-muted-light">Respuesta directa de nuestro equipo comercial.</p>
            <WhatsAppButton className="mt-5 w-full">Abrir WhatsApp</WhatsAppButton>
          </div>
          {items.map(({ icon: Icon, label, value, href }) => {
            const body = (
              <>
                <Icon className="h-5 w-5 shrink-0 text-red-light" />
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-muted-light">{label}</p>
                  <p className="truncate text-sm">{value}</p>
                </div>
              </>
            );
            const cls = 'flex items-center gap-4 rounded-lg border border-dark-3 bg-dark/80 p-4';
            return href ? (
              <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={`${cls} hover:border-dark-4`}>
                {body}
              </a>
            ) : (
              <div key={label} className={cls}>
                {body}
              </div>
            );
          })}
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-lg border border-dark-3 bg-dark/80 p-6 lg:col-span-3">
          <div>
            <p className="text-lg font-semibold">Solicitar información</p>
            <p className="mt-1 text-sm text-muted-light">Al enviar se abre WhatsApp con tu mensaje listo.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nombre">
              <Input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </Field>
            <Field label="Ciudad">
              <Input value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
            </Field>
          </div>
          <Field label="Me interesa">
            <Select value={interest} onChange={(e) => setInterest(e.target.value)}>
              {EQUIPMENT.map((e) => (
                <option key={e.slug}>{e.name}</option>
              ))}
              <option>Software DynoForge</option>
              <option>Soporte técnico</option>
              <option>Otro</option>
            </Select>
          </Field>
          <Field label="Mensaje">
            <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Cuéntanos qué vehículos trabajas, el espacio disponible, etc." />
          </Field>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#3ee07a]"
          >
            <WhatsAppIcon className="h-5 w-5" /> Enviar por WhatsApp
          </button>
        </form>
      </div>
    </>
  );
}
