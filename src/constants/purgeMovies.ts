import { Movie } from '@/types/database';

export const INITIAL_PURGE_MOVIES: Movie[] = [
  {
    id: 'a1b2c3d4-0001-4000-8000-000000000001',
    title: 'The Purge',
    title_es: 'La noche de la expiación',
    release_year: 2013,
    duration: '1h 25m',
    genre: 'Terror / Suspenso / Distopía',
    synopsis:
      'En un futuro cercano distópico en Estados Unidos, el gobierno instaura una noche anual de 12 horas donde cualquier crimen, incluido el asesinato, es completamente legal sin consecuencias penales.',
    poster_url:
      'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=800&q=80',
    created_at: '2013-05-31T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0002-4000-8000-000000000002',
    title: 'The Purge: Anarchy',
    title_es: '12 horas para sobrevivir',
    release_year: 2014,
    duration: '1h 43m',
    genre: 'Acción / Suspenso / Supervivencia',
    synopsis:
      'Un sargento atormentado por la venganza se adentra en las peligrosas calles de Los Ángeles durante la Purga, donde termina liderando a un grupo de ciudadanos inocentes para escapar de cacerías humanas.',
    poster_url:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    created_at: '2014-07-18T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0003-4000-8000-000000000003',
    title: 'The Purge: Election Year',
    title_es: '12 horas para sobrevivir: El año de la elección',
    release_year: 2016,
    duration: '1h 49m',
    genre: 'Acción / Suspenso / Conspiración',
    synopsis:
      'Una valiente senadora estadounidense que busca ganar la presidencia para abolir la Purga se convierte en el blanco prioritario de los Nuevos Padres Fundadores durante la noche más violenta del año.',
    poster_url:
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=800&q=80',
    created_at: '2016-07-01T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0004-4000-8000-000000000004',
    title: 'The First Purge',
    title_es: '12 horas para sobrevivir: El inicio',
    release_year: 2018,
    duration: '1h 37m',
    genre: 'Terror / Acción / Precuela',
    synopsis:
      'Precuela que revela el polémico origen de la Purga cuando los Nuevos Padres Fundadores de América deciden probar una teoría sociológica de violencia libre en una comunidad aislada de Staten Island.',
    poster_url:
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    created_at: '2018-07-04T00:00:00.000Z',
  },
  {
    id: 'a1b2c3d4-0005-4000-8000-000000000005',
    title: 'The Forever Purge',
    title_es: 'La purga por siempre',
    release_year: 2021,
    duration: '1h 43m',
    genre: 'Acción / Terror / Caos',
    synopsis:
      'Una peligrosa facción de forajidos decide que la Purga no finalizará con la sirena del amanecer. En medio de una rebelión interminable a nivel nacional, una familia lucha por cruzar la frontera.',
    poster_url:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80',
    created_at: '2021-07-02T00:00:00.000Z',
  },
];
