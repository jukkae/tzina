import ImprovedNoise from '../util/improved_noise'
import TextureAnimator from '../util/texture_animator'
import GeometryUtils from '../util/GeometryUtils'
import FBO from '../util/fbo'
import EndArrayPlugin from '../util/EndArrayPlugin'
TweenPlugin.activate([EndArrayPlugin]);

export default class HaimAnimation extends THREE.Object3D {
    constructor() {
        super();
        this.BASE_PATH = 'assets/animations/haim';
    }

    init(loadingManager) {
        this.loadingManager = loadingManager;
        this.setupAnim();
    }

    setupAnim() {
        this.loadingManager.itemStart("MiriamAnim");
        this.perlin = new ImprovedNoise();
        let tex_loader = new THREE.TextureLoader(this.loadingManager);
        let loader = new THREE.JSONLoader(this.loadingManager);

        // setup animation sequence
        this.animStart = false;
        this.sequenceConfig = [
            { time: 5,  anim: ()=>{this.tubeDown(0.5)} }
        ];
        this.nextAnim = null;
        this.completeSequenceSetup();

        //
        let ball = new THREE.Mesh( new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial() );
        this.add( ball );

        this.lookupTable=[];
        for (let i=0; i<50; i++) {
          this.lookupTable.push(Math.random());
        }

        this.curvePositions = [];
        this.splineHelperObjects = [];
        this.splinePointsLength = 4;
        this.ARC_SEGMENTS = 50;
        // tubes
        for ( let i = 0; i < this.splinePointsLength; i ++ ) {
            this.addSplineObject( this.curvePositions[ i ] );
        }
        this.curvePositions = [];
        for ( let i = 0; i < this.splinePointsLength; i ++ ) {
            this.curvePositions.push( this.splineHelperObjects[ i ].position );
        }

        let geometry = new THREE.Geometry();
        for ( let i = 0; i < this.ARC_SEGMENTS; i ++ ) {
            geometry.vertices.push( new THREE.Vector3() );
        }

        this.splines={};

        let liquidTex = tex_loader.load(this.BASE_PATH + '/images/liquid.jpg');
        liquidTex.repeat.x = 0.5;
        liquidTex.repeat.y = 0.5;

        this.tube = new THREE.CatmullRomCurve3( this.curvePositions );
        this.tube.type = 'catmullrom';
        // this.tube.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
        //     color: 0xffff00,
        //     opacity: 0.1,
        //     linewidth: 20
        // } ) );
        let tubeGeo = new THREE.TubeGeometry( this.tube, this.ARC_SEGMENTS, 0.2, 2, false );
        console.log("tubeGeo geometry.vertices.length: " + tubeGeo.vertices.length);
        this.tube.mesh = new THREE.Mesh( tubeGeo,
                                         new THREE.MeshBasicMaterial({color: 0xff0000, transparent: true, opacity: 0.3}) );
        this.splines.line = this.tube;

        this.tube2 = new THREE.CatmullRomCurve3( this.curvePositions );
        this.tube2.type = 'catmullrom';
        // this.tube2.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
        //     color: 0x00ffff,
        //     map: liquidTex,
        //     opacity: 1,
        //     linewidth: 10
        // } ) );
        this.tube2.mesh = new THREE.Mesh( new THREE.TubeGeometry( this.tube2, this.ARC_SEGMENTS, 0.1, 2, false ),
                                         new THREE.MeshBasicMaterial({color: 0x00ffff, map: liquidTex}) );
        this.splines.line2 = this.tube2;

        for ( let k in this.splines ) {
            let spline = this.splines[ k ];
            this.add( spline.mesh );
        }
        this.updateSplineOutline();

        console.log( this.splines.line2.mesh);


        //
        let curveData = [ {"0": [["-3.159", "10.927", "0.000"], ["-3.189", "11.500", "0.000"], ["-3.177", "12.022", "0.000"], ["-3.136", "12.631", "0.000"], ["-3.128", "13.234", "0.000"]], "1": [["-3.781", "8.857", "0.000"], ["-3.286", "9.857", "0.000"], ["-3.160", "11.100", "0.000"], ["-3.068", "12.128", "0.000"], ["-3.128", "13.234", "0.000"]], "2": [["-7.611", "5.348", "0.000"], ["-6.050", "7.141", "0.000"], ["-4.323", "8.570", "0.000"], ["-3.094", "10.206", "0.000"], ["-3.128", "13.234", "0.000"]], "3": [["-5.944", "2.942", "0.000"], ["-6.979", "5.283", "0.000"], ["-4.898", "7.275", "0.000"], ["-3.115", "9.459", "0.000"], ["-3.128", "13.234", "0.000"]], "4": [["-1.120", "0.241", "0.000"], ["-2.292", "1.358", "0.000"], ["-3.449", "3.592", "0.000"], ["-3.163", "7.837", "0.000"], ["-3.128", "13.234", "0.000"]]},
                          {"0": [["2.018", "10.354", "0.000"], ["2.019", "10.557", "0.000"], ["2.019", "10.644", "0.000"], ["2.019", "10.857", "0.000"], ["2.019", "11.103", "0.000"]], "1": [["3.076", "8.242", "0.000"], ["2.423", "9.122", "0.000"], ["2.229", "9.807", "0.000"], ["2.089", "10.399", "0.000"], ["2.023", "11.103", "0.000"]], "2": [["4.283", "5.164", "0.000"], ["4.339", "6.507", "0.000"], ["3.444", "7.655", "0.000"], ["2.348", "9.105", "0.000"], ["2.026", "11.103", "0.000"]], "3": [["3.733", "4.397", "0.000"], ["5.174", "5.680", "0.000"], ["4.101", "7.572", "0.000"], ["2.319", "8.977", "0.000"], ["2.027", "11.103", "0.000"]], "4": [["0.309", "1.753", "0.000"], ["0.922", "2.383", "0.000"], ["2.148", "3.644", "0.000"], ["2.068", "8.616", "0.000"], ["2.028", "11.103", "0.000"]]},
                          {"0": [["-5.225", "11.075", "0.000"], ["-5.225", "11.207", "0.000"], ["-5.225", "11.322", "0.000"], ["-5.225", "11.454", "0.000"], ["-5.229", "11.617", "0.000"]], "1": [["-5.531", "9.877", "0.000"], ["-5.346", "10.366", "0.000"], ["-5.282", "10.892", "0.000"], ["-5.207", "11.245", "0.000"], ["-5.229", "11.617", "0.000"]], "2": [["-6.292", "7.159", "0.000"], ["-6.103", "8.209", "0.000"], ["-5.783", "9.283", "0.000"], ["-5.226", "10.430", "0.000"], ["-5.229", "11.617", "0.000"]], "3": [["-6.584", "4.154", "0.000"], ["-7.290", "5.244", "0.000"], ["-6.810", "7.861", "0.000"], ["-5.263", "9.541", "0.000"], ["-5.229", "11.617", "0.000"]], "4": [["-2.564", "1.722", "0.000"], ["-4.488", "2.871", "0.000"], ["-5.184", "6.074", "0.000"], ["-5.283", "9.124", "0.000"], ["-5.229", "11.617", "0.000"]]},
                          {"0": [["4.340", "10.498", "0.000"], ["4.340", "10.631", "0.000"], ["4.340", "10.763", "0.000"], ["4.340", "10.949", "0.000"], ["4.340", "11.109", "0.000"]], "1": [["4.883", "9.308", "0.000"], ["4.646", "9.712", "0.000"], ["4.466", "10.098", "0.000"], ["4.394", "10.526", "0.000"], ["4.340", "11.109", "0.000"]], "2": [["5.913", "6.951", "0.000"], ["5.945", "7.930", "0.000"], ["5.383", "8.794", "0.000"], ["4.804", "9.583", "0.000"], ["4.340", "11.109", "0.000"]], "3": [["5.201", "3.987", "0.000"], ["6.796", "4.851", "0.000"], ["7.024", "6.938", "0.000"], ["4.738", "8.295", "0.000"], ["4.340", "11.109", "0.000"]], "4": [["0.395", "0.520", "0.000"], ["2.293", "1.171", "0.000"], ["4.523", "2.861", "0.000"], ["4.307", "8.094", "0.000"], ["4.340", "11.109", "0.000"]]} ];
        this.tubes = [];
        this.liquidInTubes = [];
        this.tubesVec = [];
        this.tubesCurve = [];

        // PARSE DATA
        for(let k=0; k<curveData.length; k++) {
            let curve_vec = {};
            let c_size = Object.keys( curveData[k] ).length;

            for(let i=0; i<c_size; i++) {
                curve_vec[i] = [];
                for(let j=0; j<curveData[k][i].length; j++){
                    let newVector = new THREE.Vector3( Number(curveData[k][i][j][0]),
                                                       Number(curveData[k][i][j][1]),
                                                       Number(curveData[k][i][j][2]) );
                    // scale down
                        newVector.multiplyScalar(0.5);
                        newVector.multiply( new THREE.Vector3(1,2,1) );
                    curve_vec[i].push( newVector );
                }
            }
            this.tubesVec.push( curve_vec );
        }
        // let curve_vec = {}, curve_points=[];
        // let c_size = Object.keys(curve_1).length;

        // for(let i=0; i<c_size; i++) {
        //     curve_vec[i] = [];
        //     for(let j=0; j<curve_1[i].length; j++){
        //         let newVector = new THREE.Vector3( Number(curve_1[i][j][0]),
        //                                            Number(curve_1[i][j][1]),
        //                                            Number(curve_1[i][j][2]) );
        //         // scale down
        //             newVector.multiplyScalar(0.5);
        //         curve_vec[i].push( newVector );
        //     }
        // }

        // CREATE CURVE
        this.cvMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true, morphTargets: true, transparent: true, opacity: 0.3});
        this.liquidMaterial = new THREE.MeshBasicMaterial({color: 0x00ffff, map: liquidTex, morphTargets: true, transparent: true, opacity: 1});
        this.createCurve( new THREE.Vector3(), new THREE.Vector3() );
        this.createCurve( new THREE.Vector3(), new THREE.Vector3(0,1,0) );
        this.createCurve( new THREE.Vector3(), new THREE.Vector3(0,-2,0) );

        // let c_size2 = Object.keys(curve_vec).length;

        // for(let i=0; i<c_size2; i++) {
        //     let cSpline = new THREE.CatmullRomCurve3( curve_vec[i] );
        //     cSpline.type = 'chordal';
        //     // cSpline.closed = true;
        //     // let manCurve = manSpline.getPoints( 50 );
        //     curve_points.push(cSpline);
        // }
 
        // let curveColors = [];

        // let cvGeometry = new THREE.TubeGeometry( curve_points[0], 120, 0.1, 5, false);
        
        // // console.log("manGeometry.vertices.length: " + manGeometry.vertices.length);
        // for(let i=1; i<curve_points.length; i++){
        //     let cvGeometry2 = new THREE.TubeGeometry( curve_points[i], 120, 0.1, 5, false);
        //     let nameee = 't'+(i-1);
        //     cvGeometry.morphTargets[i-1] = {name: nameee, vertices: cvGeometry2.vertices};
        // }
        // cvGeometry.computeMorphNormals();

        // this.cvTube1 = new THREE.Mesh(cvGeometry, cvMaterial);
        // // this.cvTube1.scale.set(5,5,5);
        // // this.cvTube1.rotation.y = Math.PI;
        // // this.cvTube1.position.set(1,0,-2);
        // this.add( this.cvTube1 );

        //
        this.loadingManager.itemEnd("HaimAnim");
    }

    createCurve( pos, rot ){
        for(let j=0; j<this.tubesVec.length; j++){
            let curve_points = [];
            let c_size2 = Object.keys( this.tubesVec[j] ).length;

            for(let i=0; i<c_size2; i++) {
                let cSpline = new THREE.CatmullRomCurve3( this.tubesVec[j][i] );
                cSpline.type = 'chordal';
                // cSpline.closed = true;
                // let manCurve = manSpline.getPoints( 50 );
                curve_points.push(cSpline);
            }
            let cvGeometry = new THREE.TubeGeometry( curve_points[0], this.ARC_SEGMENTS, 0.1, 5, false);
            for(let i=1; i<curve_points.length; i++){
                let cvGeometry2 = new THREE.TubeGeometry( curve_points[i], this.ARC_SEGMENTS, 0.1, 5, false);
                let nameee = 't'+(i-1);
                cvGeometry.morphTargets[i-1] = {name: nameee, vertices: cvGeometry2.vertices};
            }
            cvGeometry.computeMorphNormals();

            let cvTube = new THREE.Mesh(cvGeometry, this.cvMaterial);
            cvTube.position.copy( pos );
            cvTube.rotation.set( rot.x, rot.y, rot.z );

            this.add( cvTube );
            this.tubes.push( cvTube );

            let liquidGeo = new THREE.TubeGeometry( curve_points[curve_points.length-1], this.ARC_SEGMENTS, 0.03, 5, false);
            let tubeLiquid = new THREE.Mesh(liquidGeo, this.liquidMaterial);
            tubeLiquid.position.copy( pos );
            tubeLiquid.rotation.set( rot.x, rot.y, rot.z );
            this.add( tubeLiquid );
            this.liquidInTubes.push( tubeLiquid );
        }
    }

    addSplineObject( position ) {
        let geometry = new THREE.BoxGeometry(0.5,0.5,0.5);
        let object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff} ) );
        if ( position ) {
            object.position.copy( position );
        } else {
            object.position.x = Math.random() * 10 - 5;
            object.position.y = Math.random() * 6;
            object.position.z = Math.random() * 10 - 5;
        }
        this.add( object );
        this.splineHelperObjects.push( object );
        return object;
    }

    updateSplineOutline() {
        let p, p2;
        // for ( let k in this.splines ) {
            let spline = this.splines.line;
            let splineMesh = spline.mesh;
            for ( let i = 0; i < this.ARC_SEGMENTS; i +=2 ) {
                p = splineMesh.geometry.vertices[ i ];
                p.copy( spline.getPoint( i /  ( this.ARC_SEGMENTS - 1 ) ) );
                p2 = splineMesh.geometry.vertices[ i+1 ];
                p2.copy(p).add( new THREE.Vector3(1,0,0) );
            }
            splineMesh.geometry.verticesNeedUpdate = true;
        // }
    }

    completeSequenceSetup() {
        for(let i=0; i<this.sequenceConfig.length; i++){
            this.sequenceConfig[i].performed = false;
        }
    }

    tubeDown(_duration) {
        let tmpEndArray  = [1,0,0,0];
        let tmpEndArray2 = [0,1,0,0];
        let tmpEndArray3 = [0,0,1,0];
        let tmpEndArray4 = [0,0,0,1];
        let targets = [];
        for(let i=0; i<this.tubes.length; i++){
            targets.push( this.tubes[i].morphTargetInfluences );
        }
        this.tl = new TimelineMax({repeat: -1});
        this.tl.to( targets, _duration*2, { endArray: tmpEndArray, ease: Power0.easeNone })
               .to( targets, _duration*2, { endArray: tmpEndArray2, ease: Power0.easeNone })
               .to( targets, _duration*2, { endArray: tmpEndArray3, ease: Power0.easeNone })
               .to( targets, _duration, { endArray: tmpEndArray4, ease: Power0.easeNone });
    }
    tubeDown2(_duration) {
        let tmpEndArray = [0,1];
        TweenMax.to( this.cvTube1.morphTargetInfluences, _duration, { endArray: tmpEndArray, ease: Power0.easeNone } );
    }

    loadModelClock(model, modelB, modelC, modelD, meshMat) {

        let loader = new THREE.JSONLoader(this.loadingManager);
        let cloMat = meshMat;
        let myClock = new THREE.Object3D();
        this.myCP1 = new THREE.Object3D();
        this.myCP2 = new THREE.Object3D();
        this.grandFatherClock = new THREE.Object3D();
        this.pointer1Time = 0;
        this.pointer2Time = 0;

        loader.load(model, (geometry, material)=>{
            geometry.center();
            let cFace = new THREE.Mesh(geometry, cloMat);
            cFace.scale.set(1, 1, 1.7);
            cFace.position.set(0, 0, 3.1);
            myClock.add(cFace);
        });

        loader.load(modelB, (geometryB, material)=>{
            geometryB.center();
            this.transY(geometryB, 27);
            this.cGear = new THREE.Mesh(geometryB, cloMat);
            let myGear = new THREE.Object3D();
            myGear.add(this.cGear);
            myGear.rotation.z = -Math.PI/5;
            myClock.add(myGear);
        });

        loader.load(modelC, (geometryC, material)=>{
            geometryC.center();
            let cP1 = new THREE.Mesh(geometryC, cloMat);
            cP1.position.set(-2.2, 0, 6);
            cP1.scale.set(1, 1, 2.5);
            this.myCP1.add(cP1);
            myClock.add(this.myCP1);
            //
            // TweenMax.to(this.myCP1.rotation, 0.5, {z:"+="+0.1, repeat:-1, repeatDelay:2});
        });

        loader.load(modelD, (geometryD, material)=>{
            geometryD.center();
            let cP2 = new THREE.Mesh(geometryD, cloMat);
            cP2.position.set(0,12,3);
            cP2.scale.set(1, 1, 2.5);
            this.myCP2.add(cP2);
            myClock.add(this.myCP2);
            //
            // TweenMax.to(this.myCP2.rotation, 0.5, {z:"+="-0.1, repeat:-1, repeatDelay:2.6});

            myClock.position.y = -80;
            this.grandFatherClock.add(myClock);

            for(let i=0; i<6; i++){
                let geoTemp = new THREE.CylinderGeometry(0.5 ,0.5 ,90);
                let bar = new THREE.Mesh(geoTemp, cloMat);
                bar.position.y = -15;
                bar.position.x = i*3 - 8;
                this.grandFatherClock.add(bar);
            }

            this.grandFatherClock.scale.multiplyScalar(0.01);
            this.grandFatherClock.position.set(1, 3, -1.2);
            // this.grandFatherClock.rotation.y = Math.PI;

            this.add(this.grandFatherClock);

        });

    }

    transX(geo, n){
        for(let i=0; i<geo.vertices.length; i++){
            geo.vertices[i].x += n;
        }
    }

    transZ(geo, n){
        for(let i=0; i<geo.vertices.length; i++){
            geo.vertices[i].z += n;
        }
    }

    transY(geo, n){
        for(let i=0; i<geo.vertices.length; i++){
            geo.vertices[i].y += n;
        }
    }

    start() {
        this.currentSequence = this.sequenceConfig.slice(0);
        this.nextAnim = this.currentSequence.shift();
    }

    updateVideoTime(time) {
        if (this.nextAnim && time >= this.nextAnim.time) {
            console.log("do anim sequence ", this.nextAnim);
            this.nextAnim.anim();
            if (this.currentSequence.length > 0) {
                this.nextAnim = this.currentSequence.shift();
            } else {
                this.nextAnim = null;
            }
        }
    }

    update(dt,et) {
        // 
        this.splineHelperObjects[1].position.x += 0.01;
        this.updateSplineOutline();

       this.splines.line2.mesh.material.map.offset.x+=0.01;
    }
}