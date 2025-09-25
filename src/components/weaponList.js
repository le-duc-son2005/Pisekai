import { weapons } from '../share/data.js';
import { autoChangeRarityColor } from '../Utils.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../style/weaponList.css';

const WeaponList = () => {
    return (
        <div className="weapon-page">
            <div className="container my-4">
                <h3 className="text-center mb-5 titleAll">──── Weapons ────</h3>
                <div className="row g-3">
                    {weapons.map((weapon) => (
                        <div className="col-12 col-md-6 col-lg-3" key={weapon.id}>
                            <div className="card h-100 shadow-sm">
                                <img src={weapon.image} className="card-img-top" alt={weapon.name} />
                                <div className="card-body">
                                    <h5 className="card-title">{weapon.name}</h5>
                                    <p className="card-text">
                                        <strong>Type: </strong> <span className="text-detail">{weapon.type}</span> <br />
                                        <strong>Origin: </strong> <span className="text-detail">{weapon.origin}</span><br />
                                        <strong>Description: </strong> <span className="text-detail">{weapon.description}</span> <br />
                                        <strong>Rarity: </strong>
                                        <span className="pros-rarity" style={{ color: autoChangeRarityColor(weapon.rarity), fontWeight: 700 }}>
                                            {weapon.rarity}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};


export default WeaponList;