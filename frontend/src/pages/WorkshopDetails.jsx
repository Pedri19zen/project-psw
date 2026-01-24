import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getWorkshopDetails } from '../services/api';

const WorkshopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({ workshop: null, services: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const result = await getWorkshopDetails(id);
        setData(result);
      } catch (err) {
        console.error("Erro", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleBookClick = (serviceId) => {
    // Redireciona para a página de agendamento (Passo 3)
    // Passamos o ID da oficina e do serviço escolhido
    navigate(`/book?workshop=${id}&service=${serviceId}`);
  };

  if (loading) return <p>A carregar informações...</p>;
  if (!data.workshop) return <p>Oficina não encontrada.</p>;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: 'auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '20px', cursor: 'pointer', padding: '5px 10px' }}>
        &larr; Voltar
      </button>

      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ marginBottom: '10px' }}>{data.workshop.name}</h1>
        <p style={{ color: '#666', fontSize: '1.1em' }}>{data.workshop.location}</p>
      </div>

      <h2>Serviços Disponíveis</h2>
      <div style={{ display: 'grid', gap: '15px' }}>
        {data.services.length > 0 ? (
          data.services.map(service => (
            <div key={service._id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              backgroundColor: 'white'
            }}>
              <div style={{ maxWidth: '70%' }}>
                <h3 style={{ margin: '0 0 5px 0' }}>{service.name}</h3>
                <p style={{ margin: 0, color: '#555' }}>{service.description}</p>
                <div style={{ marginTop: '5px', fontSize: '0.9em', color: '#888' }}>
                  Duração estimada: {service.duration} min
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '10px' }}>
                  {service.price} €
                </div>
                <button 
                  onClick={() => handleBookClick(service._id)}
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Agendar
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>Esta oficina ainda não tem serviços configurados.</p>
        )}
      </div>
    </div>
  );
};

export default WorkshopDetails;