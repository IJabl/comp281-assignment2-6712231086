import * as THREE from 'three'; // three จากที่กำหนดใน importmap
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import Stats from 'three/addons/libs/stats.module.js';
import { M3D, createLabel2D, FPS } from './utils-module.js';

document.addEventListener("DOMContentLoaded", main);

function main() {
	// ใช้ M3D ที่นำเข้ามา
	document.body.appendChild(M3D.renderer.domElement);
	document.body.appendChild(M3D.cssRenderer.domElement);

	M3D.renderer.setClearColor(0x333333); // กำหนดสีพื้นหลังของ renderer (canvas)
	M3D.renderer.setPixelRatio(window.devicePixelRatio); // ปรับความละเอียดของ renderer ให้เหมาะสมกับหน้าจอ
	M3D.renderer.shadowMap.enabled = true; // เปิดใช้งาน shadow map
	M3D.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // กำหนดประเภทของ shadow map
	M3D.renderer.physicallyCorrectLights = true; // เปิดใช้งานการคำนวณแสงแบบฟิสิกส์
	M3D.renderer.outputEncoding = THREE.sRGBEncoding; // กำหนดการเข้ารหัสสีของ renderer
	M3D.renderer.setAnimationLoop(animate); // ตั้งค่า animation loop

	// Prepaire objects here
	// TODO: วาดฉากทิวทัศน์ 3D ด้วย Three.js
	//สร้างพื้น
	const groundGeometry = new THREE.BoxGeometry(500, 500, 5);
	const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // สีเขียว
	const ground = new THREE.Mesh(groundGeometry, groundMaterial);
	ground.rotation.x = -Math.PI / 2; // หมุนพื้นให้ราบกับแกน X
	ground.shadowReceive = true; // ให้พื้นรับเงา
	M3D.scene.add(ground);	

	//สร้างแม่น้ำ
	const riverGeometry = new THREE.BoxGeometry(150, 500, 5);
	const riverMaterial = new THREE.MeshStandardMaterial({ color: 0x1E90FF, side: THREE.DoubleSide }); // สีน้ำเงิน
	const river = new THREE.Mesh(riverGeometry, riverMaterial);
	river.rotation.x = -Math.PI / 2; // หมุนแม่น้ำให้ราบกับแกน X
	river.position.set(0, 0.5, 0); // เลื่อนแม่น้ำขึ้นเล็กน้อยเพื่อหลีกเลี่ยงการซ้อนทับกับพื้น
	M3D.scene.add(river);

	// สร้างภูเขา1
	const mountainGeometry = new THREE.SphereGeometry(150, 32, 32);
	const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // สีน้ำตาล
	const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
	mountain.position.set(-150, 5, -250);
	mountain.castShadow = true; // ให้ภูเขาหล่อเงา
	M3D.scene.add(mountain);
	
	//สร้างภูเขา2
	const mountain2Geometry = new THREE.SphereGeometry(175, 32, 32);
	const mountain2Material = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // สีน้ำตาล
	const mountain2 = new THREE.Mesh(mountain2Geometry, mountain2Material);
	mountain2.position.set(100, 5, -300);
	mountain2.castShadow = true; // ให้ภูเขาหล่อเงา
	M3D.scene.add(mountain2);

	//สร้างพระอาทิตย์
	const sunGeometry = new THREE.SphereGeometry(50, 32, 32);
	const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 }); // สีเหลือง
	const sun = new THREE.Mesh(sunGeometry, sunMaterial);
	sun.position.set(20, 300, 150);
	M3D.scene.add(sun);
	//แสงอาทิตย์
	const sunlight = new THREE.DirectionalLight(0xFFFFFF, 1);
	sunlight.position.set(20, 300, 150);
	sunlight.castShadow = true; // ให้แสงหล่อเงา
	sunlight.shadow.mapSize.width = 1024;
	sunlight.shadow.mapSize.height = 1024;
	sunlight.shadow.camera.near = 0.5;
	sunlight.shadow.camera.far = 1000;
	M3D.scene.add(sunlight);

	//สร้างกระท่อม
	const hutGeometry = new THREE.BoxGeometry(30, 20, 30);
	const hutMaterial = new THREE.MeshStandardMaterial({ color: 0xFFA500 }); // สีส้ม
	const hut = new THREE.Mesh(hutGeometry, hutMaterial);
	hut.position.set(200, 10, 50);
	hut.castsShadow = true; // ให้กระท่อมหล่อเงา
	M3D.scene.add(hut);
	//หลังคากระท่อม
	const roofGeometry = new THREE.ConeGeometry(25, 15, 4);
	const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x8B0000 }); // สีแดงเข้ม
	const roof = new THREE.Mesh(roofGeometry, roofMaterial);
	roof.position.set(200, 25, 50);
	roof.castShadow = true; // ให้หลังคาหล่อเงา
	roof.rotation.y = Math.PI / 4; // หมุนหลังคาให้เข้ากับตัวกระท่อม
	M3D.scene.add(roof);

	//สร้างต้นไม้
	function createTree(x, z) {
		const tree = new THREE.Group();
		const trunkGeometry = new THREE.CylinderGeometry(2, 2, 20);
		const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // สีน้ำตาล
		const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
		trunk.position.y = 10;
		trunk.castShadow = true; // ให้ลำต้นหล่อเงา
		tree.add(trunk);

		const foliageGeometry = new THREE.ConeGeometry(10, 20, 10);
		const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 }); // สีเขียวเข้ม
		const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
		foliage.position.y = 30;
		tree.add(foliage);
		tree.position.set(x, 0, z);
		tree.castShadow = true; // ให้ต้นไม้หล่อเงา
		M3D.scene.add(tree);
	}

	// สร้างต้นไม้หลายๆ ต้นในตำแหน่งต่างๆ
	createTree(-100, 0);
	createTree(-100, 50);
	createTree(-100, 100);
	createTree(-150, 0);
	createTree(-150, 50);
	createTree(-150, 100);
	createTree(-200, 0);
	createTree(-200, 50);
	createTree(-200, 100);

	//สร้างท้องนา
	const fieldGeometry = new THREE.BoxGeometry(150, 150, 5);
	const fieldMaterial = new THREE.MeshStandardMaterial({ color: 0x90EE90, side: THREE.DoubleSide }); // สีเขียวอ่อน
	const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
	field.rotation.x = -Math.PI / 2; // หมุนท้องนาให้ราบกับแกน X
	field.position.set(-150, 0.5, 50); // เลื่อนท้องนาขึ้นเล็กน้อยเพื่อหลีกเลี่ยงการซ้อนทับกับพื้น
	M3D.scene.add(field);	


	// ต้องมีครบ 6 อย่าง: ภูเขา, พระอาทิตย์, ท้องนา, ต้นไม้, บ้าน/กระท่อม, แม่น้ำ
	// องค์ประกอบอื่น ๆ เพิ่มเติมได้ตามต้องการ (เช่น ท้องฟ้า, ก้อนเมฆ ฯลฯ)

	
	// Stats
	const stats = new Stats(); // สร้าง Stats เพื่อตรวจสอบประสิทธิภาพ
	document.body.appendChild(stats.dom); // เพิ่ม Stats ลงใน body ของ HTML

	// GUI
	const gui = new GUI(); // สร้าง GUI สำหรับปรับแต่งค่าต่างๆ 


	function animate() {
		M3D.controls.update(); // อัปเดต controls
		stats.update(); // อัปเดต Stats
		FPS.update(); // อัปเดต FPS

		// UPDATE state of objects here
		// TODO: อัปเดตสถานะของวัตถุต่างๆ ที่ต้องการในแต่ละเฟรม (เช่น การเคลื่อนที่, การหมุน ฯลฯ)


		// RENDER scene and camera
		M3D.renderer.render(M3D.scene, M3D.camera); // เรนเดอร์ฉาก
		M3D.cssRenderer.render(M3D.scene, M3D.camera); // เรนเดอร์ CSS2DRenderer
		console.log(`FPS: ${FPS.fps}`); // แสดงค่า FPS ในคอนโซล
	}
}