import { useState, useEffect } from "react";
import api from "../../services/api";
import styles from "./ServiceList.module.css";
import { useNavigate } from "react-router-dom";

const ServiceList = () => {
	const navigate = useNavigate();
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchServices = async () => {
			try {
				const response = await api.get("/services");
				setServices(response.data);
				setLoading(false);
			} catch (err) {
				console.error(err);
				setError("Failed to load services.");
				setLoading(false);
			}
		};

		fetchServices();
	}, []);

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this service?")) {
			try {
				await api.delete(`/services/${id}`);
				setServices(services.filter((service) => service._id !== id));
			} catch (err) {
				alert("Error deleting service");
			}
		}
	};

	if (loading)
		return (
			<div className="fade-in" style={{ padding: "2rem", color: "#94a3b8", textAlign: "center" }}>
				Loading services...
			</div>
		);
	if (error)
		return <div style={{ padding: "2rem", color: "#fca5a5", textAlign: "center" }}>{error}</div>;

	return (
		<div className={styles.container} style={{ background: "#1e293b", borderRadius: "12px", border: "1px solid #334155" }}>
			<div className={styles.header}>
				<h2 style={{ color: "#f1f5f9" }}>Service Catalog</h2>

				<button
					className="btn-primary"
					style={{
						backgroundColor: "#2563eb",
						color: "white",
						border: "none",
						padding: "10px 20px",
						borderRadius: "8px",
						fontWeight: "bold",
						cursor: "pointer"
					}}
					onClick={() => navigate("/admin/services/new")}>
					+ Add New Service
				</button>
			</div>

			<table className={styles.table}>
				<thead>
					<tr style={{ borderBottom: "1px solid #334155" }}>
						<th style={{ color: "#94a3b8" }}>Service Name</th>
						<th style={{ color: "#94a3b8" }}>Type</th>
						<th style={{ color: "#94a3b8" }}>Duration</th>
						<th style={{ color: "#94a3b8" }}>Price</th>
						<th style={{ color: "#94a3b8" }}>Mechanics</th>
						<th style={{ color: "#94a3b8" }}>Actions</th>
					</tr>
				</thead>
				<tbody>
					{services.map((service) => (
						<tr key={service._id} style={{ borderBottom: "1px solid #334155" }}>
							<td style={{ color: "#f1f5f9" }}>
								<strong>{service.name}</strong>
							</td>
							<td>
								<span className={styles.badge}>{service.type}</span>
							</td>
							<td style={{ color: "#cbd5e1" }}>{service.duration} min</td>
							<td style={{ color: "#60a5fa", fontWeight: "bold" }}>{service.price}€</td>
							<td style={{ color: "#94a3b8" }}>
								<small className={styles.mechanicCount}>
									{service.authorizedMechanics?.length || 0} Staff
								</small>
							</td>
							<td className={styles.actions}>
								<button
									className="btn-primary"
									style={{
										marginRight: "8px",
										padding: "6px 12px",
										fontSize: "0.8rem",
										backgroundColor: "#334155",
										color: "#60a5fa",
										border: "1px solid #475569",
										borderRadius: "4px",
										cursor: "pointer"
									}}
									onClick={() => navigate(`/admin/services/${service._id}`)}
								>
									Edit
								</button>

								<button
									style={{ 
										padding: "6px 12px", 
										fontSize: "0.8rem",
										backgroundColor: "#7f1d1d",
										color: "#fecaca",
										border: "none",
										borderRadius: "4px",
										cursor: "pointer"
									}}
									onClick={() => handleDelete(service._id)}>
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{services.length === 0 && (
				<div className={styles.emptyState} style={{ color: "#94a3b8", padding: "2rem" }}>
					No services found. Add one above!
				</div>
			)}
		</div>
	);
};

export default ServiceList;